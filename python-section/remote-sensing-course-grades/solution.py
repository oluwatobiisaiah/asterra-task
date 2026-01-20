import pandas as pd
import json
import logging
from pathlib import Path
from typing import Dict, List, Tuple
import sys
from dataclasses import dataclass

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('grade_processing.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


@dataclass
class GradeConfig:
    quiz_max: int = 10
    homework_max: int = 100
    exam_max: int = 100
    weight_homework: float = 0.10
    weight_quiz: float = 0.25
    weight_exam: float = 0.65
    base_dir: Path = Path("python-section/remote-sensing-course-grades/assets")
    output_file: str = "final_grades.xlsx"
    
    def __post_init__(self):
        total_weight = self.weight_homework + self.weight_quiz + self.weight_exam
        if abs(total_weight - 1.0) > 1e-10:
            raise ValueError(f"Grade weights must sum to 1.0, got {total_weight}")


class DataValidator:    
    @staticmethod
    def validate_grade_range(df: pd.DataFrame, col: str, min_val: float, 
                            max_val: float) -> Tuple[int, int]:
        """Validate grades are within expected range."""
        out_of_range = df[(df[col] < min_val) | (df[col] > max_val)][col].dropna()
        invalid_count = out_of_range.count()
        
        if invalid_count > 0:
            logger.warning(
                f"{col}: {invalid_count} values out of range [{min_val}, {max_val}]. "
                f"Examples: {out_of_range.head(3).tolist()}"
            )
        
        return invalid_count, len(df)
    
    @staticmethod
    def check_duplicates(df: pd.DataFrame, col: str) -> int:
        duplicates = df[df[col].duplicated()][col]
        dup_count = len(duplicates)
        
        if dup_count > 0:
            logger.error(f"Found {dup_count} duplicate {col}s: {duplicates.tolist()[:5]}")
        
        return dup_count
    
    @staticmethod
    def check_missing_data(df: pd.DataFrame, required_cols: List[str]) -> Dict[str, int]:
        missing = {}
        for col in required_cols:
            if col not in df.columns:
                logger.error(f"Required column '{col}' not found in dataframe")
                missing[col] = len(df)
            else:
                null_count = df[col].isna().sum()
                if null_count > 0:
                    logger.warning(f"{col}: {null_count} missing values ({null_count/len(df)*100:.1f}%)")
                missing[col] = null_count
        
        return missing


class GradeProcessor:
    
    def __init__(self, config: GradeConfig):
        self.config = config
        self.validator = DataValidator()
    
    def load_csv_with_types(self, filepath: Path, dtype_spec: Dict = None) -> pd.DataFrame:
        """Load CSV with optimized data types."""
        if not filepath.exists():
            raise FileNotFoundError(f"Required file not found: {filepath}")
        
        logger.info(f"Loading {filepath.name}...")
        
        df = pd.read_csv(filepath, dtype=dtype_spec or {})
        
        logger.info(f"Loaded {len(df)} rows, memory: {df.memory_usage(deep=True).sum() / 1024:.1f} KB")
        return df
    
    def load_students_json(self, filepath: Path) -> pd.DataFrame:
        """
        Load students from JSON file.
        
        """
        if not filepath.exists():
            raise FileNotFoundError(f"Students file not found: {filepath}")
        
        logger.info(f"Loading {filepath.name}...")
        
        with open(filepath, "r") as f:
            json_string = json.load(f)
            
            if not isinstance(json_string, str):
                raise ValueError(
                    f"Expected stringified JSON array, got {type(json_string).__name__}"
                )
            
            students_list = json.loads(json_string)
        
        df = pd.DataFrame(students_list)
        
        for col in df.select_dtypes(include=['object']).columns:
            if df[col].nunique() / len(df) < 0.5: 
                df[col] = df[col].astype('category')
        
        logger.info(f"Loaded {len(df)} students")
        return df
    
    def normalize_ids(self, df: pd.DataFrame, col_name: str) -> pd.DataFrame:
        """Normalize ID column to lowercase, trimmed strings."""
        if col_name not in df.columns:
            raise ValueError(f"Column '{col_name}' not found")
        
        df[col_name] = df[col_name].astype(str).str.lower().str.strip()
        
        self.validator.check_duplicates(df, col_name)
        
        return df
    
    def convert_to_numeric_safe(self, series: pd.Series, col_name: str) -> pd.Series:
        numeric_series = pd.to_numeric(series, errors='coerce')
        failed_count = numeric_series.isna().sum() - series.isna().sum()
        
        if failed_count > 0:
            logger.warning(f"{col_name}: {failed_count} values failed numeric conversion")
        
        return numeric_series
    
    def load_and_prepare_data(self) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        hw_exam_df = self.load_csv_with_types(
            self.config.base_dir / "Homework_and_exams.csv",
            dtype_spec={'SID': 'string'}
        )
        
        quiz1_df = self.load_csv_with_types(
            self.config.base_dir / "quiz_1_grades.csv",
            dtype_spec={'SID': 'string'}
        )
        
        quiz2_df = self.load_csv_with_types(
            self.config.base_dir / "quiz_2_grades.csv",
            dtype_spec={'SID': 'string'}
        )
        
        students = self.load_students_json(
            self.config.base_dir / "students.json"
        )
        
        students = self.normalize_ids(students, "NetID")
        hw_exam_df = self.normalize_ids(hw_exam_df, "SID")
        quiz1_df = self.normalize_ids(quiz1_df, "SID")
        quiz2_df = self.normalize_ids(quiz2_df, "SID")
        
        grade_keywords = ["Homework", "Exam", "Final"]
        grade_cols = [c for c in hw_exam_df.columns 
                     if any(kw in c for kw in grade_keywords)]
        
        for col in grade_cols:
            hw_exam_df[col] = self.convert_to_numeric_safe(hw_exam_df[col], col)
            if "Homework" in col:
                self.validator.validate_grade_range(hw_exam_df, col, 0, self.config.homework_max)
        
        quiz1_df["Grade"] = self.convert_to_numeric_safe(quiz1_df["Grade"], "Quiz1")
        quiz2_df["Grade"] = self.convert_to_numeric_safe(quiz2_df["Grade"], "Quiz2")
        
        self.validator.validate_grade_range(quiz1_df, "Grade", 0, self.config.quiz_max)
        self.validator.validate_grade_range(quiz2_df, "Grade", 0, self.config.quiz_max)
        
        return students, hw_exam_df, quiz1_df, quiz2_df
    
    def merge_data_efficiently(self, students: pd.DataFrame, 
                              hw_exam_df: pd.DataFrame,
                              quiz1_df: pd.DataFrame, 
                              quiz2_df: pd.DataFrame) -> pd.DataFrame:
        
        logger.info("Merging dataframes...")
        
        quizzes = quiz1_df[["SID", "Grade"]].rename(columns={"Grade": "Quiz1"})
        quizzes = quizzes.merge(
            quiz2_df[["SID", "Grade"]].rename(columns={"Grade": "Quiz2"}),
            on="SID",
            how="outer"
        )
        
        merged = students.merge(hw_exam_df, left_on="NetID", right_on="SID", how="left")
        
        if "SID" in merged.columns and "NetID" in merged.columns:
            merged = merged.drop(columns=["SID"])
        
        merged = merged.merge(quizzes, left_on="NetID", right_on="SID", how="left")
        
        if "SID" in merged.columns:
            merged = merged.drop(columns=["SID"])
        
        logger.info(f"Merged dataframe size: {len(merged)} rows, "
                   f"{merged.memory_usage(deep=True).sum() / 1024:.1f} KB")
        
        return merged
    
    def calculate_final_grades(self, df: pd.DataFrame) -> pd.DataFrame:
        
        logger.info("Calculating final grades...")
        
        hw_cols = [c for c in df.columns if c.startswith("Homework")]
        if not hw_cols:
            raise ValueError("No homework columns found")
        
        logger.info(f"Found {len(hw_cols)} homework assignments")
        
        df["HomeworkAvg"] = df[hw_cols].mean(axis=1)
        df["QuizAvg"] = df[["Quiz1", "Quiz2"]].mean(axis=1)
        
        # Drop individual homework columns to save memory
        df = df.drop(columns=hw_cols)
        
        exam_cols = [c for c in df.columns if "Exam" in c or "Final" in c]
        if not exam_cols:
            raise ValueError("No exam column found")
        if len(exam_cols) > 1:
            logger.warning(f"Multiple exam columns found: {exam_cols}. Using {exam_cols[0]}")
        exam_col = exam_cols[0]
        
        # Normalize to 100-point scale
        df["QuizNorm"] = (df["QuizAvg"] / self.config.quiz_max) * 100
        df["HomeworkNorm"] = (df["HomeworkAvg"] / self.config.homework_max) * 100
        df["ExamNorm"] = (df[exam_col] / self.config.exam_max) * 100
        
        df["FinalGrade"] = (
            self.config.weight_homework * df["HomeworkNorm"] +
            self.config.weight_quiz * df["QuizNorm"] +
            self.config.weight_exam * df["ExamNorm"]
        )
        
        self.validator.validate_grade_range(df, "FinalGrade", 0, 100)
        
        essential_cols = ["Name", "ID", "Group", "NetID", "FinalGrade", 
                         "HomeworkAvg", "QuizAvg", exam_col]
        df = df[[c for c in essential_cols if c in df.columns]]
        
        logger.info(f"Final dataframe memory: {df.memory_usage(deep=True).sum() / 1024:.1f} KB")
        
        return df
    
    def export_results(self, df: pd.DataFrame) -> None:        
        output_cols = ["Name", "ID", "Group", "FinalGrade"]
        output = df[output_cols].copy()
        
        # Check for missing groups
        missing_group = output["Group"].isna().sum()
        if missing_group > 0:
            logger.warning(f"{missing_group} students missing group assignment")
        
        groups = sorted(output["Group"].dropna().unique())
        logger.info(f"Exporting {len(groups)} groups to {self.config.output_file}")
        
        with pd.ExcelWriter(self.config.output_file, engine="openpyxl") as writer:
            for grp in groups:
                df_group = output[output["Group"] == grp].sort_values(
                    "FinalGrade", 
                    ascending=False
                )
                
                sheet_name = f"Group_{grp}"[:31]  # Excel sheet name limit
                df_group.to_excel(writer, sheet_name=sheet_name, index=False)
                
                logger.info(f"  {sheet_name}: {len(df_group)} students, "
                           f"avg grade: {df_group['FinalGrade'].mean():.2f}")
        
        logger.info(f"Output saved to {self.config.output_file}")
    
    def print_summary(self, df: pd.DataFrame) -> None:
        
        print("\n" + "="*60)
        print("GRADE PROCESSING SUMMARY")
        print("="*60)
        print(f"Total students processed: {len(df)}")
        print(f"Students with final grades: {df['FinalGrade'].notna().sum()}")
        print(f"Students missing grades: {df['FinalGrade'].isna().sum()}")
        print(f"\nGrade Statistics:")
        print(f"  Mean: {df['FinalGrade'].mean():.2f}")
        print(f"  Median: {df['FinalGrade'].median():.2f}")
        print(f"  Std Dev: {df['FinalGrade'].std():.2f}")
        print(f"  Min: {df['FinalGrade'].min():.2f}")
        print(f"  Max: {df['FinalGrade'].max():.2f}")
        print(f"\nGroups: {sorted(df['Group'].dropna().unique())}")
        print("="*60 + "\n")
    
    def process(self) -> None:
        try:
            logger.info("Starting grade processing pipeline...")
            
            students, hw_exam_df, quiz1_df, quiz2_df = self.load_and_prepare_data()
            
            merged = self.merge_data_efficiently(students, hw_exam_df, quiz1_df, quiz2_df)
            
            final_df = self.calculate_final_grades(merged)
            
            self.export_results(final_df)
            
            self.print_summary(final_df)
            
            logger.info("Processing completed successfully!")
            
        except Exception as e:
            logger.error(f"Processing failed: {e}", exc_info=True)
            raise


def main():
    config = GradeConfig()
    processor = GradeProcessor(config)
    processor.process()


if __name__ == "__main__":
    main()