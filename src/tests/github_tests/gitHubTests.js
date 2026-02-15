// Хранилище тестов
let tests = [];
let currentEditId = null;

// Пример данных для инициализации
const sampleTest = {
  id: Date.now(),
  assignment_type: "github",
  version: 0,
  title:
    "Реализация ключевых компонентов системы с соблюдением чистого кода и архитектурных решений",
  max_score: 100,
  passing_score: 70,
  repository_task: "https://github.com/your-org/module4-implementation-task",
  repository_rules:
    "https://github.com/your-org/module4-implementation-task/blob/main/.github/CONTRIBUTING.md",
  required_branch: "develop",
};

// Добавляем пример при загрузке
tests.push(sampleTest);

// Функция для отрисовки списка тестов
function renderTests() {
  const container = document.getElementById("testsContainer");

  if (tests.length === 0) {
    container.innerHTML = `
                    <div class="empty-state">
                        <div>📭</div>
                        <h3>Нет заданий</h3>
                        <p>Создайте новое задание с помощью формы выше</p>
                    </div>
                `;
    return;
  }

  container.innerHTML = tests
    .map(
      (test) => `
                <div class="test-card">
                    <h3>${escapeHtml(test.title)}</h3>
                    <div class="meta">
                        <span>🎯 Макс: ${test.max_score}</span>
                        <span>✅ Проходной: ${test.passing_score}</span>
                        <span>🌿 Ветка: ${test.required_branch}</span>
                        <span class="badge badge-success">v${test.version}</span>
                    </div>
                    <div class="repository-info">
                        <div>📦 Задание: <a href="${test.repository_task}" target="_blank">${test.repository_task}</a></div>
                        <div>📋 Правила: <a href="${test.repository_rules}" target="_blank">${test.repository_rules}</a></div>
                    </div>
                    <div class="card-actions">
                        <button class="edit-btn" onclick="editTest('${test.id}')">
                            <span>✏️</span> Ред.
                        </button>
                        <button class="delete-btn" onclick="deleteTest('${test.id}')">
                            <span>🗑️</span> Уд.
                        </button>
                    </div>
                </div>
            `,
    )
    .join("");
}

// Экранирование HTML для безопасности
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Функция для заполнения формы данными теста
function fillForm(test) {
  document.getElementById("title").value = test.title || "";
  document.getElementById("max_score").value = test.max_score || 100;
  document.getElementById("passing_score").value = test.passing_score || 70;
  document.getElementById("repository_task").value = test.repository_task || "";
  document.getElementById("repository_rules").value =
    test.repository_rules || "";
  document.getElementById("required_branch").value =
    test.required_branch || "develop";
  document.getElementById("version").value = test.version || 0;
  document.getElementById("editId").value = test.id || "";

  document.getElementById("formTitle").textContent = "Редактировать задание";
  document.getElementById("submitBtn").innerHTML =
    "<span>🔄</span> Обновить задание";
}

// Функция для очистки формы
function clearForm() {
  document.getElementById("testForm").reset();
  document.getElementById("editId").value = "";
  document.getElementById("version").value = "0";
  document.getElementById("title").value = "";
  document.getElementById("repository_task").value = "";
  document.getElementById("repository_rules").value = "";
  document.getElementById("required_branch").value = "develop";
  document.getElementById("max_score").value = "100";
  document.getElementById("passing_score").value = "70";

  document.getElementById("formTitle").textContent = "Создать новое задание";
  document.getElementById("submitBtn").innerHTML =
    "<span>💾</span> Сохранить задание";
  currentEditId = null;
}

// Функция отмены редактирования
window.cancelEdit = function () {
  clearForm();
};

// Функция редактирования теста
window.editTest = function (id) {
  const test = tests.find((t) => t.id == id);
  if (test) {
    fillForm(test);
    currentEditId = id;
  }
};

// Функция удаления теста
window.deleteTest = function (id) {
  if (confirm("Вы уверены, что хотите удалить это задание?")) {
    tests = tests.filter((t) => t.id != id);
    renderTests();

    // Если удаляем текущий редактируемый тест, очищаем форму
    if (currentEditId == id) {
      clearForm();
    }
  }
};

// Обработчик отправки формы
document.getElementById("testForm").addEventListener("submit", function (e) {
  e.preventDefault();

  // Собираем данные из формы
  const testData = {
    id: document.getElementById("editId").value || Date.now().toString(),
    assignment_type: "github",
    version: parseInt(document.getElementById("version").value) || 0,
    title: document.getElementById("title").value,
    max_score: parseInt(document.getElementById("max_score").value),
    passing_score: parseInt(document.getElementById("passing_score").value),
    repository_task: document.getElementById("repository_task").value,
    repository_rules: document.getElementById("repository_rules").value,
    required_branch: document.getElementById("required_branch").value,
  };

  // Валидация
  if (testData.passing_score > testData.max_score) {
    alert("Проходной балл не может быть больше максимального!");
    return;
  }

  // Проверяем, редактирование это или создание
  const existingIndex = tests.findIndex((t) => t.id == testData.id);

  if (existingIndex !== -1) {
    // Обновляем существующий тест
    testData.version = tests[existingIndex].version + 1;
    tests[existingIndex] = testData;
  } else {
    // Добавляем новый тест
    tests.push(testData);
  }

  // Перерисовываем список
  renderTests();

  // Очищаем форму
  clearForm();

  // Показываем сообщение об успехе
  alert(
    existingIndex !== -1
      ? "Задание успешно обновлено!"
      : "Задание успешно создано!",
  );
});

// Инициализация
renderTests();
