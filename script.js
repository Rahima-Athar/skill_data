
const supabaseUrl = "https://egwzmsczmbheknnxsvgi.supabase.co";

const supabaseKey = "sb_publishable_OB_MAclZ_ycER3HeIuo02Q_Up2zae9n";

const db = window.supabase.skill_data(
    supabaseUrl,
    supabaseKey
);

console.log("Supabase client initialized successfully!");


const skillForm = document.getElementById("skillForm");
const skillIdInput = document.getElementById("skillId");
const userIdInput = document.getElementById("userId");
const skillNameInput = document.getElementById("skillName");
const categoryInput = document.getElementById("category");
const proficiencyInput = document.getElementById("proficiency");
const experienceInput = document.getElementById("experience");

const tableBody = document.getElementById("skillsTableBody");
const emptyMessage = document.getElementById("emptyMessage");
const skillCount = document.getElementById("skillCount");
const searchInput = document.getElementById("searchInput");

const submitButton = document.getElementById("submitButton");
const cancelButton = document.getElementById("cancelButton");
const formTitle = document.getElementById("formTitle");

let skills = JSON.parse(localStorage.getItem("userSkills")) || [];

function saveSkills() {
  localStorage.setItem("userSkills", JSON.stringify(skills));
}

function createDate() {
  return new Date().toLocaleDateString("en-GB");
}

function getBadgeClass(level) {
  return level.toLowerCase();
}

function renderSkills(searchText = "") {
  tableBody.innerHTML = "";

  const filteredSkills = skills.filter((skill) => {
    const searchValue = searchText.toLowerCase();

    return (
      skill.skillName.toLowerCase().includes(searchValue) ||
      skill.category.toLowerCase().includes(searchValue) ||
      skill.proficiency.toLowerCase().includes(searchValue)
    );
  });

  skillCount.textContent = `${filteredSkills.length} skill${
    filteredSkills.length !== 1 ? "s" : ""
  } found`;

  if (filteredSkills.length === 0) {
    emptyMessage.style.display = "block";
    return;
  }

  emptyMessage.style.display = "none";

  filteredSkills.forEach((skill) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${skill.id}</td>
      <td>${skill.userId}</td>
      <td><strong>${escapeHTML(skill.skillName)}</strong></td>
      <td>${escapeHTML(skill.category)}</td>
      <td>
        <span class="badge ${getBadgeClass(skill.proficiency)}">
          ${escapeHTML(skill.proficiency)}
        </span>
      </td>
      <td>${skill.experience} years</td>
      <td>${skill.createdAt}</td>
      <td>
        <button class="btn edit" onclick="editSkill(${skill.id})">
          Edit
        </button>
        <button class="btn delete" onclick="deleteSkill(${skill.id})">
          Delete
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

skillForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const record = {
    skill_name: skillNameInput.value.trim(),
    category: categoryInput.value,
    proficiency_level: proficiencyInput.value,
    years_experience: Number(experienceInput.value)
  };

  console.log("Supabase ko bheja ja raha data:", record);

  const { data, error } = await db
    .from("user_skills")
    .insert(record)
    .select();

  if (error) {
    console.error("Supabase insert error:", error);
    alert("Data save nahi hua: " + error.message);
    return;
  }

  console.log("Supabase mein save hua:", data);
  alert("Skill Supabase mein save ho gayi.");

  skillForm.reset();
  loadSkillsFromSupabase();
});
{
  submitButton.textContent = "Add Skill";
  cancelButton.classList.add("hidden");
}

cancelButton.addEventListener("click", resetForm);

searchInput.addEventListener("input", function () {
  renderSkills(searchInput.value);
});

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

renderSkills();
