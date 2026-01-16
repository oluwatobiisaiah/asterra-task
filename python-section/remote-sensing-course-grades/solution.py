import pandas as pd
import json


# Normalization Constants
QUIZ_MAX = 10
HOMEWORK_MAX = 100
EXAM_MAX = 100

# File paths
homework_exam_path = "python-section/remote-sensing-course-grades/assets/Homework_and_exams.csv"
quiz1_path = "python-section/remote-sensing-course-grades/assets/quiz_1_grades.csv"
quiz2_path = "python-section/remote-sensing-course-grades/assets/quiz_2_grades.csv"
students_json_path = "python-section/remote-sensing-course-grades/assets/students.json"

# Load files
hw_exam_df = pd.read_csv(homework_exam_path)
quiz1_df = pd.read_csv(quiz1_path)
quiz2_df = pd.read_csv(quiz2_path)

with open(students_json_path, "r") as f:
    raw = json.load(f)          # This loads the STRING
    students_list = json.loads(raw)  # This parses the string into real JSON
    students = pd.DataFrame(students_list)

# Normalize IDs
students["NetID"] = students["NetID"].str.lower()
hw_exam_df["SID"] = hw_exam_df["SID"].str.lower()
quiz1_df["SID"] = quiz1_df["SID"].str.lower()
quiz2_df["SID"] = quiz2_df["SID"].str.lower()

for col in hw_exam_df.columns:
    if col.startswith("Homework") or "Exam" in col or "Final" in col:
        hw_exam_df[col] = pd.to_numeric(hw_exam_df[col], errors="coerce")

quiz1_df["Grade"] = pd.to_numeric(quiz1_df["Grade"], errors="coerce")
quiz2_df["Grade"] = pd.to_numeric(quiz2_df["Grade"], errors="coerce")

merged = students.merge(hw_exam_df, left_on="NetID", right_on="SID", how="left")
merged = merged.merge(quiz1_df[["SID", "Grade"]].rename(columns={"Grade": "Quiz1"}), on="SID", how="left")
merged = merged.merge(quiz2_df[["SID", "Grade"]].rename(columns={"Grade": "Quiz2"}), on="SID", how="left")

# Compute averages
hw_cols = [c for c in merged.columns if c.startswith("Homework")]
merged["HomeworkAvg"] = merged[hw_cols].mean(axis=1)
merged["QuizAvg"] = merged[["Quiz1", "Quiz2"]].mean(axis=1)

# Detect exam column
exam_col = [c for c in merged.columns if "Exam" in c or "Final" in c][0]


merged["QuizNorm"] = (merged["QuizAvg"] / QUIZ_MAX) * 100
merged["HomeworkNorm"] = (merged["HomeworkAvg"] / HOMEWORK_MAX) * 100
merged["ExamNorm"] = (merged[exam_col] / EXAM_MAX) * 100

merged["FinalGrade"] = (
    0.10 * merged["HomeworkNorm"] +
    0.25 * merged["QuizNorm"] +
    0.65 * merged["ExamNorm"]
)


# Output
out = merged[["Name", "ID", "Group", "FinalGrade"]]

# Write Excel (one sheet per group)
with pd.ExcelWriter("final_grades.xlsx", engine="openpyxl") as writer:
    for grp in sorted(out["Group"].unique()):
        df_g = out[out["Group"] == grp].sort_values("FinalGrade", ascending=False)
        df_g.to_excel(writer, sheet_name=f"Group_{grp}", index=False)

print("Done. Output saved as final_grades.xlsx")
