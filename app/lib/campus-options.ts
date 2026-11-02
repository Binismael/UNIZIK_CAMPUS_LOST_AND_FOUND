// Edit these lists to change the Faculty, Department, Level and Hostel dropdowns.
export const DEPARTMENTS_BY_FACULTY: Record<string, readonly string[]> = {
  Agriculture: ["Agricultural Economics", "Animal Science", "Crop Science", "Soil Science"],
  Arts: ["English Language and Literature", "History and International Studies", "Linguistics", "Music", "Philosophy"],
  "Biosciences": ["Applied Biochemistry", "Botany", "Microbiology", "Zoology"],
  Education: ["Adult Education", "Educational Foundations", "Guidance and Counselling", "Science Education"],
  Engineering: ["Chemical Engineering", "Civil Engineering", "Computer Engineering", "Electrical Engineering", "Mechanical Engineering"],
  "Environmental Sciences": ["Architecture", "Estate Management", "Geography", "Quantity Surveying"],
  "Health Sciences": ["Medical Laboratory Science", "Nursing Science", "Radiography"],
  Law: ["Law"],
  "Management Sciences": ["Accountancy", "Banking and Finance", "Business Administration", "Marketing"],
  "Physical Sciences": ["Computer Science", "Geology", "Mathematics", "Physics and Industrial Physics", "Statistics"],
  Pharmaceutical: ["Pharmacy"],
  "Social Sciences": ["Economics", "Mass Communication", "Political Science", "Psychology", "Sociology"],
};

export const FACULTIES = Object.keys(DEPARTMENTS_BY_FACULTY);

export const LEVELS = ["100", "200", "300", "400", "500"] as const;

export const RESIDENCES = [
  "Aroma Hostel",
  "Female Hostel A",
  "Female Hostel B",
  "Male Hostel A",
  "Male Hostel B",
  "Postgraduate Hostel",
  "Off campus",
] as const;

// Placeholder: replace with your real support inbox.
export const HELP_EMAIL = "support@example.com";
