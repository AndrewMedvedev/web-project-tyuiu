// Исходные данные
let questions = [
  {
    text: "Опишите основные этапы жизненного цикла программного обеспечения (ЖЦ ПО) и кратко объясните, какая цель преследуется на каждом из них. Какие последствия могут быть, если пропустить один из этапов, например, этап тестирования?",
    options: [
      "Пропуск этапа тестирования не влияет на качество ПО, если разработчики опытные",
      "Пропуск тестирования может привести к выходу ПО с критическими ошибками, что повлияет на репутацию и безопасность",
      "Тестирование можно заменить этапом проектирования",
    ],
    correct_answers: [1],
    points: 1,
  },
  {
    text: "В чём принципиальное различие между программированием и инженерией программного обеспечения? Приведите пример, когда простое программирование может оказаться недостаточным, и объясните, почему в этом случае требуется именно инженерный подход.",
    options: [
      "Программирование — это написание кода, а инженерия ПО — только управление командой разработчиков",
      "Инженерия ПО включает в себя только тестирование и документирование, а программирование — это реализация",
      "Инженерия ПО — это системный подход, включающий планирование, анализ требований, проектирование, тестирование и сопровождение, тогда как программирование — лишь часть этого процесса",
    ],
    correct_answers: [2],
    points: 1,
  },
  {
    text: "Команда разработчиков получила от заказчика описание функциональности нового приложения для учёта рабочего времени. Сейчас они анализируют, какие именно данные нужно собирать, как пользователи будут взаимодействовать с системой, какие ограничения существуют (например, интеграция с существующими системами). На каком этапе жизненного цикла ПО находится проект? Обоснуйте свой ответ.",
    options: [
      "Этап программирования",
      "Этап сопровождения",
      "Этап анализа требований",
    ],
    correct_answers: [2],
    points: 1,
  },
];

let currentQuestionIndex = null;

// Инициализация
document.addEventListener("DOMContentLoaded", () => {
  renderQuestions();
});

// Отрисовка всех вопросов
function renderQuestions() {
  const container = document.getElementById("questions-container");
  container.innerHTML = "";

  questions.forEach((question, index) => {
    const questionBlock = createQuestionElement(question, index);
    container.appendChild(questionBlock);
  });
}

// Создание элемента вопроса
function createQuestionElement(question, index) {
  const block = document.createElement("div");
  block.className = "content-block editing-mode";
  block.dataset.index = index;

  const indicator = document.createElement("div");
  indicator.className = "editing-indicator";
  indicator.textContent = "✎ Редактируется";
  block.appendChild(indicator);

  // Заголовок
  const label = document.createElement("div");
  label.className = "content-type-label";
  label.textContent = `Вопрос ${index + 1} • ${question.points} ${getPointsWord(question.points)}`;
  block.appendChild(label);

  // Контент вопроса
  block.appendChild(createEditableQuestion(question, index));

  return block;
}

// Создание редактируемого вопроса
function createEditableQuestion(question, index) {
  const div = document.createElement("div");

  // Текст вопроса
  const questionDiv = document.createElement("div");
  questionDiv.className = "question-text";

  const questionLabel = document.createElement("label");
  questionLabel.textContent = "Текст вопроса:";
  questionLabel.style.display = "block";
  questionLabel.style.marginBottom = "8px";
  questionLabel.style.fontWeight = "500";

  const textarea = document.createElement("textarea");
  textarea.value = question.text;
  textarea.oninput = (e) => updateQuestion(index, "text", e.target.value);

  questionDiv.appendChild(questionLabel);
  questionDiv.appendChild(textarea);
  div.appendChild(questionDiv);

  // Варианты ответов
  const optionsLabel = document.createElement("div");
  optionsLabel.style.marginBottom = "12px";
  optionsLabel.style.fontWeight = "500";
  optionsLabel.textContent = "Варианты ответов (отметьте правильные):";
  div.appendChild(optionsLabel);

  const optionsDiv = document.createElement("div");
  optionsDiv.className = "quiz-options";

  question.options.forEach((option, optIndex) => {
    const optionDiv = document.createElement("div");
    optionDiv.className = "quiz-option";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = question.correct_answers.includes(optIndex);
    checkbox.onchange = (e) =>
      toggleCorrectAnswer(index, optIndex, e.target.checked);

    const textInput = document.createElement("input");
    textInput.type = "text";
    textInput.value = option;
    textInput.className = "quiz-option-content";
    textInput.oninput = (e) => updateOption(index, optIndex, e.target.value);

    const controls = document.createElement("div");
    controls.className = "option-controls";

    if (question.options.length > 2) {
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "✕";
      deleteBtn.className = "delete-option";
      deleteBtn.onclick = () => deleteOption(index, optIndex);
      controls.appendChild(deleteBtn);
    }

    optionDiv.appendChild(checkbox);
    optionDiv.appendChild(textInput);
    optionDiv.appendChild(controls);
    optionsDiv.appendChild(optionDiv);
  });

  div.appendChild(optionsDiv);

  // Кнопка добавления варианта
  const addOptionBtn = document.createElement("button");
  addOptionBtn.className = "add-option-btn";
  addOptionBtn.innerHTML = "<span>➕</span> Добавить вариант ответа";
  addOptionBtn.onclick = () => addOption(index);
  div.appendChild(addOptionBtn);

  // Баллы
  const pointsDiv = document.createElement("div");
  pointsDiv.className = "quiz-points";

  const pointsLabel = document.createElement("label");
  pointsLabel.textContent = "Баллы за вопрос:";

  const pointsInput = document.createElement("input");
  pointsInput.type = "number";
  pointsInput.min = "1";
  pointsInput.max = "10";
  pointsInput.value = question.points;
  pointsInput.onchange = (e) =>
    updateQuestion(index, "points", parseInt(e.target.value) || 1);

  pointsDiv.appendChild(pointsLabel);
  pointsDiv.appendChild(pointsInput);
  div.appendChild(pointsDiv);

  // Панель управления блоком
  const controls = document.createElement("div");
  controls.className = "block-controls";

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "block-control-btn delete-btn";
  deleteBtn.innerHTML = "<span>🗑️</span> Удалить вопрос";
  deleteBtn.onclick = () => showDeleteModal(index);

  const addBtn = document.createElement("button");
  addBtn.className = "block-control-btn add-btn";
  addBtn.innerHTML = "<span>➕</span> Добавить после";
  addBtn.onclick = () => addQuestionAfter(index);

  controls.appendChild(deleteBtn);
  controls.appendChild(addBtn);
  div.appendChild(controls);

  return div;
}

// Обновление поля вопроса
function updateQuestion(index, field, value) {
  questions[index][field] = value;
}

// Обновление варианта ответа
function updateOption(questionIndex, optionIndex, value) {
  questions[questionIndex].options[optionIndex] = value;
}

// Переключение правильного ответа
function toggleCorrectAnswer(questionIndex, optionIndex, checked) {
  const question = questions[questionIndex];
  if (checked) {
    if (!question.correct_answers.includes(optionIndex)) {
      question.correct_answers.push(optionIndex);
    }
  } else {
    question.correct_answers = question.correct_answers.filter(
      (i) => i !== optionIndex,
    );
  }
}

// Добавление нового варианта
function addOption(questionIndex) {
  const question = questions[questionIndex];
  question.options.push("Новый вариант ответа");
  renderQuestions();
}

// Удаление варианта
function deleteOption(questionIndex, optionIndex) {
  const question = questions[questionIndex];

  // Удаляем вариант
  question.options.splice(optionIndex, 1);

  // Обновляем индексы правильных ответов
  question.correct_answers = question.correct_answers
    .filter((i) => i !== optionIndex)
    .map((i) => (i > optionIndex ? i - 1 : i));

  renderQuestions();
}

// Добавление вопроса после указанного
function addQuestionAfter(index) {
  const newQuestion = {
    text: "Новый вопрос",
    options: ["Вариант 1", "Вариант 2", "Вариант 3"],
    correct_answers: [0],
    points: 1,
  };

  questions.splice(index + 1, 0, newQuestion);
  renderQuestions();

  // Прокрутка к новому вопросу
  setTimeout(() => {
    const blocks = document.querySelectorAll(".content-block");
    if (blocks[index + 1]) {
      blocks[index + 1].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, 100);
}

// Добавление нового вопроса в конец
function addNewQuestion() {
  if (questions.length === 0) {
    // Если вопросов нет, создаем первый
    const newQuestion = {
      text: "Новый вопрос",
      options: ["Вариант 1", "Вариант 2", "Вариант 3"],
      correct_answers: [0],
      points: 1,
    };
    questions.push(newQuestion);
  } else {
    addQuestionAfter(questions.length - 1);
  }
  renderQuestions();
}

// Показ модального окна удаления
function showDeleteModal(index) {
  currentQuestionIndex = index;
  document.getElementById("modal-title").textContent = "Удаление вопроса";
  document.getElementById("modal-message").textContent =
    "Вы уверены, что хотите удалить этот вопрос?";
  document.getElementById("modal-confirm").onclick = confirmDelete;
  document.getElementById("confirm-modal").classList.add("active");
}

// Подтверждение удаления
function confirmDelete() {
  if (currentQuestionIndex !== null) {
    questions.splice(currentQuestionIndex, 1);
    renderQuestions();
    closeModal();
  }
}

// Закрытие модального окна
function closeModal() {
  document.getElementById("confirm-modal").classList.remove("active");
  currentQuestionIndex = null;
}

// Сохранение изменений
function saveQuestions() {
  // Выводим данные в консоль
  console.log("Сохраненные вопросы:", JSON.stringify(questions, null, 2));

  // Сохраняем в localStorage
  localStorage.setItem("savedQuestions", JSON.stringify(questions));

  // Визуальный feedback
  const btn = document.querySelector(".publish-button");
  const originalText = btn.innerHTML;
  btn.innerHTML = "✅ Сохранено!";

  setTimeout(() => {
    btn.innerHTML = originalText;
  }, 2000);

  // Показываем уведомление (можно заменить на более красивое)
  alert(
    "Изменения сохранены! Проверьте консоль браузера (F12) для просмотра данных.",
  );
}

// Вспомогательная функция для склонения слова "балл"
function getPointsWord(points) {
  if (points % 10 === 1 && points % 100 !== 11) return "балл";
  if ([2, 3, 4].includes(points % 10) && ![12, 13, 14].includes(points % 100))
    return "балла";
  return "баллов";
}

// Инициализация кнопки добавления
document.getElementById("add-question-btn").onclick = addNewQuestion;

// Загрузка сохраненных вопросов из localStorage (если есть)
const savedQuestions = localStorage.getItem("savedQuestions");
if (savedQuestions) {
  try {
    const parsed = JSON.parse(savedQuestions);
    if (Array.isArray(parsed) && parsed.length > 0) {
      questions = parsed;
    }
  } catch (e) {
    console.log("Ошибка загрузки сохраненных вопросов");
  }
}
