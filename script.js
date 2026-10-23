
const supabaseUrl = "https://egwzmsczmbheknnxsvgi.supabase.co";

const supabaseKey = "sb_publishable_OB_MAclZ_ycER3HeIuo02Q_Up2zae9n";

const db = window.supabase.createClient(
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

let skills = [];
let saving = false;

function showError(error) {
  console.error(error);
  alert("Supabase request failed: " + error.message +
    "\nCheck the project URL/key, user_skills columns, and RLS policies (see README).");
}

async function loadSkillsFromSupabase() {
  const { data, error } = await db.from("user_skills").select("id,user_id,skill_name,category,proficiency_level,years_experience,created_at").order("id", { ascending: false });
  if (error) throw error;
  skills = data.map((row) => ({
    id: row.id, userId: row.user_id, skillName: row.skill_name,
    category: row.category, proficiency: row.proficiency_level,
    experience: row.years_experience,
    createdAt: row.created_at ? new Date(row.created_at).toLocaleDateString("en-GB") : "—"
  }));
  renderSkills(searchInput.value);
}

function resetForm() {
  skillForm.reset();
  skillIdInput.value = "";
  formTitle.textContent = "Add New Skill";
  submitButton.textContent = "Add Skill";
  cancelButton.classList.add("hidden");
}

function editSkill(id) {
  if (saving) return;
  const skill = skills.find((item) => String(item.id) === String(id));
  if (!skill) return;
  skillIdInput.value = skill.id;
  userIdInput.value = skill.userId;
  skillNameInput.value = skill.skillName;
  categoryInput.value = skill.category;
  proficiencyInput.value = skill.proficiency;
  experienceInput.value = skill.experience;
  formTitle.textContent = "Edit Skill";
  submitButton.textContent = "Update Skill";
  cancelButton.classList.remove("hidden");
  skillNameInput.focus();
}

async function deleteSkill(id) {
  if (saving || !confirm("Delete this skill?")) return;
  saving = true;
  try {
    const { data, error } = await db.from("user_skills").delete().eq("id", id).select("id");
    if (error) throw error;
    if (!data.length) throw new Error("No row deleted. Check your access policies.");
    if (String(skillIdInput.value) === String(id)) resetForm();
    await loadSkillsFromSupabase();
  } catch (error) { showError(error); }
  finally { saving = false; }
}

function getBadgeClass(level) {
  return ["Beginner", "Intermediate", "Expert"].includes(level) ? level.toLowerCase() : "";
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
      <td>${escapeHTML(skill.id)}</td>
      <td>${escapeHTML(skill.userId)}</td>
      <td><strong>${escapeHTML(skill.skillName)}</strong></td>
      <td>${escapeHTML(skill.category)}</td>
      <td>
        <span class="badge ${getBadgeClass(skill.proficiency)}">
          ${escapeHTML(skill.proficiency)}
        </span>
      </td>
      <td>${escapeHTML(skill.experience)} years</td>
      <td>${escapeHTML(skill.createdAt)}</td>
      <td>
        <button class="btn edit" data-action="edit">
          Edit
        </button>
        <button class="btn delete" data-action="delete">
          Delete
        </button>
      </td>
    `;

    row.querySelector('[data-action="edit"]').addEventListener("click", () => editSkill(skill.id));
    row.querySelector('[data-action="delete"]').addEventListener("click", () => deleteSkill(skill.id));
    tableBody.appendChild(row);
  });
}

skillForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  if (saving) return;
  const record = {
    user_id: Number(userIdInput.value),
    skill_name: skillNameInput.value.trim(),
    category: categoryInput.value,
    proficiency_level: proficiencyInput.value,
    years_experience: Number(experienceInput.value)
  };
  if (!record.skill_name || !Number.isSafeInteger(record.user_id) || record.user_id < 1 ||
      !Number.isFinite(record.years_experience) || record.years_experience < 0 || record.years_experience > 99) {
    alert("Enter a valid skill, positive integer user ID, and experience between 0 and 99.");
    return;
  }
  saving = true;
  submitButton.disabled = true;
  cancelButton.disabled = true;
  try {
    const query = skillIdInput.value
      ? db.from("user_skills").update(record).eq("id", skillIdInput.value)
      : db.from("user_skills").insert(record);
    const { data, error } = await query.select("id");
    if (error) throw error;
    if (!data.length) throw new Error("No row saved. Check your access policies.");
    resetForm();
    await loadSkillsFromSupabase();
  } catch (error) { showError(error); }
  finally {
    saving = false;
    submitButton.disabled = false;
    cancelButton.disabled = false;
  }
});

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

loadSkillsFromSupabase().catch(showError);
