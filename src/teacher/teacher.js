import { getContentTypeLabel } from "../general/utils.js";
import { courseContent } from "./test.js";

// Глобальные переменные
let courseData = null;
let onTypeSelectCallback = null;

// Инициализация админ-панели
async function initAdmin() {
  try {
    // Загружаем данные курса из JSON файла или другого источника
    await loadCourseData();
    hideLoading();
    renderContentBlocks();
    setupEventListeners();
  } catch (error) {
    console.error("Ошибка инициализации:", error);
    showError("Не удалось загрузить данные курса");
  }
}

// Загрузка данных курса
async function loadCourseData() {
  try {
    courseData = courseContent;
  } catch (error) {
    console.error("Ошибка загрузки данных:", error);
    // Создаем минимальные демо данные
    courseData = {
      modules: [createEmptyModule()],
    };
  }
}

// Создание пустого модуля
function createEmptyModule() {
  return {
    title: "Новый модуль",
    description: "Описание модуля",
    order: 0,
    content_blocks: [createEmptyBlock("text")],
  };
}

// Создание пустого блока
function createEmptyBlock(type) {
  const templates = {
    text: {
      content_type: "text",
      md_content: "# Новый текст\n\nВведите содержание здесь...",
      ai_generated: false,
    },
    video: {
      content_type: "video",
      platform: "YouTube",
      title: "Новое видео",
      url: "",
      discussion_questions: [],
      duration_seconds: 0,
      key_moments: {},
      ai_generated: false,
    },
    code: {
      content_type: "code",
      language: "python",
      code: 'print("Hello, World!")',
      explanation: "Пояснение к коду...",
      ai_generated: false,
    },
    quiz: {
      content_type: "quiz",
      questions: [["Вопрос 1?", "Ответ 1"]],
      ai_generated: false,
    },
    mermaid: {
      content_type: "mermaid",
      title: "Новая диаграмма",
      mermaid_code: "graph TD\n  A[Начало] --> B[Конец]",
      explanation: "Пояснение к диаграмме...",
      ai_generated: false,
    },
  };

  return templates[type] || templates.text;
}

// Рендеринг контент блоков
function renderContentBlocks() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  if (!courseData.modules || courseData.modules.length === 0) {
    courseData.modules = [createEmptyModule()];
  }

  const module = courseData;

  // Убеждаемся, что content_blocks существует
  if (!module.content_blocks) {
    module.content_blocks = [];
  }

  // Контейнер для блоков
  const blocksContainer = document.createElement("div");
  blocksContainer.className = "blocks-container";
  blocksContainer.id = "blocksContainer";

  // Рендерим блоки
  if (module.content_blocks && module.content_blocks.length > 0) {
    module.content_blocks.forEach((block, index) => {
      const blockElement = createBlockEditor(block, index);
      blocksContainer.appendChild(blockElement);
    });
  }

  app.appendChild(blocksContainer);

  // Кнопка добавления блока
  const addBlockBtn = document.createElement("button");
  addBlockBtn.className = "add-block-btn";
  addBlockBtn.innerHTML = "➕ <span>Добавить блок</span>";
  addBlockBtn.addEventListener("click", () => {
    showBlockTypeModal((type) => {
      addNewBlock(type);
    });
  });

  app.appendChild(addBlockBtn);
}

// Создание редактора блока
function createBlockEditor(block, index) {
  const blockElement = document.createElement("div");
  blockElement.className = "content-block editable-block";
  blockElement.dataset.blockIndex = index;

  const typeLabel = document.createElement("div");
  typeLabel.className = "content-type-label";
  typeLabel.textContent = getContentTypeLabel(block.content_type);
  blockElement.appendChild(typeLabel);

  // Кнопки управления блоком
  const controls = document.createElement("div");
  controls.className = "block-editor-controls";

  // Кнопка перемещения вверх
  if (index > 0) {
    const moveUpBtn = document.createElement("button");
    moveUpBtn.className = "block-control-btn move-up-btn";
    moveUpBtn.title = "Переместить вверх";
    moveUpBtn.innerHTML = "↑";
    moveUpBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      moveBlockUp(index);
    });
    controls.appendChild(moveUpBtn);
  }

  // Кнопка перемещения вниз
  if (index < courseData.content_blocks.length - 1) {
    const moveDownBtn = document.createElement("button");
    moveDownBtn.className = "block-control-btn move-down-btn";
    moveDownBtn.title = "Переместить вниз";
    moveDownBtn.innerHTML = "↓";
    moveDownBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      moveBlockDown(index);
    });
    controls.appendChild(moveDownBtn);
  }

  // Кнопка удаления
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "block-control-btn delete-btn";
  deleteBtn.title = "Удалить блок";
  deleteBtn.innerHTML = "×";
  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    deleteBlock(index);
  });
  controls.appendChild(deleteBtn);

  blockElement.appendChild(controls);

  // Контент блока в зависимости от типа
  const contentContainer = document.createElement("div");
  contentContainer.style.position = "relative";

  switch (block.content_type) {
    case "text":
      renderTextEditor(contentContainer, block, index);
      break;
    case "video":
      renderVideoEditor(contentContainer, block, index);
      break;
    case "code":
      renderCodeEditor(contentContainer, block, index);
      break;
    case "quiz":
      renderQuizEditor(contentContainer, block, index);
      break;
    case "mermaid":
      renderMermaidEditor(contentContainer, block, index);
      break;
    default:
      renderTextEditor(contentContainer, block, index);
  }

  blockElement.appendChild(contentContainer);

  // Кнопка "Добавить блок ниже"
  const addBelowBtn = document.createElement("button");
  addBelowBtn.className = "add-block-btn";
  addBelowBtn.style.marginTop = "15px";
  addBelowBtn.style.padding = "8px";
  addBelowBtn.style.fontSize = "14px";
  addBelowBtn.innerHTML = "➕ Добавить блок ниже";
  addBelowBtn.title = "Добавить блок ниже";
  addBelowBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    showBlockTypeModal((type) => {
      addBlockBelow(index, type);
    });
  });

  blockElement.appendChild(addBelowBtn);

  return blockElement;
}

// Рендеринг редактора текста
function renderTextEditor(container, block, index) {
  const textarea = document.createElement("textarea");
  textarea.className = "text-editor";
  textarea.value = block.md_content || "";
  textarea.addEventListener("input", (e) => {
    block.md_content = e.target.value;
  });

  container.appendChild(textarea);
}

// Рендеринг редактора видео
function renderVideoEditor(container, block, index) {
  const editor = document.createElement("div");

  // URL видео
  const urlGroup = document.createElement("div");
  urlGroup.className = "form-group";
  urlGroup.innerHTML = `
        <label class="form-label">URL видео:</label>
        <input type="url" class="form-control video-url-input" 
               value="${block.url || ""}" 
               placeholder="https://www.youtube.com/watch?v=...">
    `;

  urlGroup.querySelector("input").addEventListener("input", (e) => {
    block.url = e.target.value;
  });

  // Название видео
  const titleGroup = document.createElement("div");
  titleGroup.className = "form-group";
  titleGroup.innerHTML = `
        <label class="form-label">Название видео:</label>
        <input type="text" class="form-control" 
               value="${block.title || ""}" 
               placeholder="Введите название видео">
    `;

  titleGroup.querySelector("input").addEventListener("input", (e) => {
    block.title = e.target.value;
  });

  // Платформа
  const platformGroup = document.createElement("div");
  platformGroup.className = "form-group";
  platformGroup.innerHTML = `
        <label class="form-label">Платформа:</label>
        <select class="form-control">
            <option value="YouTube" ${block.platform === "YouTube" ? "selected" : ""}>YouTube</option>
            <option value="RuTube" ${block.platform === "RuTube" ? "selected" : ""}>RuTube</option>
            <option value="Vimeo" ${block.platform === "Vimeo" ? "selected" : ""}>Vimeo</option>
        </select>
    `;

  platformGroup.querySelector("select").addEventListener("change", (e) => {
    block.platform = e.target.value;
  });

  // Длительность
  const durationGroup = document.createElement("div");
  durationGroup.className = "form-group";
  durationGroup.innerHTML = `
        <label class="form-label">Длительность (секунды):</label>
        <input type="number" class="form-control" 
               value="${block.duration_seconds || 0}" min="0">
    `;

  durationGroup.querySelector("input").addEventListener("input", (e) => {
    block.duration_seconds = parseInt(e.target.value) || 0;
  });

  // Ключевые моменты
  const momentsDiv = document.createElement("div");
  momentsDiv.className = "key-moments-editor";

  const momentsLabel = document.createElement("label");
  momentsLabel.className = "form-label";
  momentsLabel.textContent = "Ключевые моменты:";
  momentsDiv.appendChild(momentsLabel);

  const momentsContainer = document.createElement("div");
  momentsContainer.id = `moments-${index}`;

  // Рендерим существующие моменты
  if (block.key_moments) {
    Object.entries(block.key_moments).forEach(
      ([time, description], momentIndex) => {
        addKeyMomentRow(momentsContainer, block, time, description);
      },
    );
  }

  momentsDiv.appendChild(momentsContainer);

  // Кнопка добавления момента
  const addMomentBtn = document.createElement("button");
  addMomentBtn.type = "button";
  addMomentBtn.className = "add-key-moment";
  addMomentBtn.textContent = "+ Добавить момент";
  addMomentBtn.addEventListener("click", () => {
    addKeyMomentRow(momentsContainer, block, "", "");
  });

  momentsDiv.appendChild(addMomentBtn);

  // Вопросы для обсуждения
  const questionsDiv = document.createElement("div");
  questionsDiv.className = "key-moments-editor";
  questionsDiv.style.marginTop = "20px";

  const questionsLabel = document.createElement("label");
  questionsLabel.className = "form-label";
  questionsLabel.textContent = "Вопросы для обсуждения:";
  questionsDiv.appendChild(questionsLabel);

  const questionsContainer = document.createElement("div");
  questionsContainer.id = `questions-${index}`;

  // Рендерим существующие вопросы
  if (block.discussion_questions && Array.isArray(block.discussion_questions)) {
    block.discussion_questions.forEach((question, qIndex) => {
      addQuestionRow(questionsContainer, block, question, qIndex);
    });
  }

  questionsDiv.appendChild(questionsContainer);

  // Кнопка добавления вопроса
  const addQuestionBtn = document.createElement("button");
  addQuestionBtn.type = "button";
  addQuestionBtn.className = "add-key-moment";
  addQuestionBtn.textContent = "+ Добавить вопрос";
  addQuestionBtn.addEventListener("click", () => {
    addQuestionRow(questionsContainer, block, "");
  });

  questionsDiv.appendChild(addQuestionBtn);

  editor.appendChild(urlGroup);
  editor.appendChild(titleGroup);
  editor.appendChild(platformGroup);
  editor.appendChild(durationGroup);
  editor.appendChild(momentsDiv);
  editor.appendChild(questionsDiv);

  container.appendChild(editor);
}

// Добавление строки ключевого момента
function addKeyMomentRow(container, block, time, description) {
  const momentRow = document.createElement("div");
  momentRow.className = "key-moment-row";

  const timeInput = document.createElement("input");
  timeInput.type = "text";
  timeInput.className = "key-moment-time";
  timeInput.value = time;
  timeInput.placeholder = "0:00";

  const descInput = document.createElement("input");
  descInput.type = "text";
  descInput.style.flex = "1";
  descInput.value = description;
  descInput.placeholder = "Описание момента";

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.innerHTML = "×";
  deleteBtn.style.background = "#fed7d7";
  deleteBtn.style.color = "#9b2c2c";
  deleteBtn.style.border = "none";
  deleteBtn.style.borderRadius = "4px";
  deleteBtn.style.width = "30px";
  deleteBtn.style.height = "30px";
  deleteBtn.style.cursor = "pointer";

  deleteBtn.addEventListener("click", () => {
    momentRow.remove();
    updateKeyMoments(block);
  });

  momentRow.appendChild(timeInput);
  momentRow.appendChild(descInput);
  momentRow.appendChild(deleteBtn);
  container.appendChild(momentRow);

  // Обновляем данные при изменении
  const updateHandler = () => {
    updateKeyMoments(block);
  };

  timeInput.addEventListener("input", updateHandler);
  descInput.addEventListener("input", updateHandler);
}

// Обновление ключевых моментов
function updateKeyMoments(block) {
  const container = document.querySelector(
    ".key-moments-editor .key-moment-row",
  )?.parentElement;
  if (!container) return;

  block.key_moments = {};
  container.querySelectorAll(".key-moment-row").forEach((row) => {
    const time = row.querySelector(".key-moment-time").value;
    const desc = row.querySelector('input[type="text"]:nth-child(2)').value;
    if (time && desc) {
      block.key_moments[time] = desc;
    }
  });
}

// Добавление строки вопроса
function addQuestionRow(container, block, question, index) {
  const questionRow = document.createElement("div");
  questionRow.className = "question-editor";

  const textarea = document.createElement("textarea");
  textarea.className = "form-control";
  textarea.value = question;
  textarea.rows = 2;
  textarea.placeholder = "Введите вопрос для обсуждения";

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "delete-question-btn";
  deleteBtn.textContent = "Удалить вопрос";

  questionRow.appendChild(textarea);
  questionRow.appendChild(deleteBtn);

  container.appendChild(questionRow);

  // Определяем индекс вопроса
  const qIndex = index !== undefined ? index : container.children.length - 1;

  deleteBtn.addEventListener("click", () => {
    questionRow.remove();
    if (
      block.discussion_questions &&
      Array.isArray(block.discussion_questions)
    ) {
      block.discussion_questions.splice(qIndex, 1);
    }
  });

  textarea.addEventListener("input", (e) => {
    if (
      !block.discussion_questions ||
      !Array.isArray(block.discussion_questions)
    ) {
      block.discussion_questions = [];
    }
    block.discussion_questions[qIndex] = e.target.value;
  });
}

// Рендеринг редактора кода
function renderCodeEditor(container, block, index) {
  const editor = document.createElement("div");

  // Язык программирования
  const langGroup = document.createElement("div");
  langGroup.className = "form-group";
  langGroup.innerHTML = `
        <label class="form-label">Язык программирования:</label>
        <select class="form-control">
            <option value="python" ${block.language === "python" ? "selected" : ""}>Python</option>
            <option value="javascript" ${block.language === "javascript" ? "selected" : ""}>JavaScript</option>
            <option value="java" ${block.language === "java" ? "selected" : ""}>Java</option>
            <option value="cpp" ${block.language === "cpp" ? "selected" : ""}>C++</option>
            <option value="c" ${block.language === "c" ? "selected" : ""}>C</option>
            <option value="csharp" ${block.language === "csharp" ? "selected" : ""}>C#</option>
            <option value="php" ${block.language === "php" ? "selected" : ""}>PHP</option>
            <option value="ruby" ${block.language === "ruby" ? "selected" : ""}>Ruby</option>
            <option value="go" ${block.language === "go" ? "selected" : ""}>Go</option>
            <option value="rust" ${block.language === "rust" ? "selected" : ""}>Rust</option>
            <option value="text" ${!block.language || block.language === "text" ? "selected" : ""}>Текст</option>
        </select>
    `;

  langGroup.querySelector("select").addEventListener("change", (e) => {
    block.language = e.target.value;
  });

  // Код
  const codeGroup = document.createElement("div");
  codeGroup.className = "form-group";
  codeGroup.innerHTML = `
        <label class="form-label">Код:</label>
        <textarea class="text-editor" style="font-family: monospace; min-height: 150px;">${block.code || ""}</textarea>
    `;

  codeGroup.querySelector("textarea").addEventListener("input", (e) => {
    block.code = e.target.value;
  });

  // Пояснение
  const expGroup = document.createElement("div");
  expGroup.className = "form-group";
  expGroup.innerHTML = `
        <label class="form-label">Пояснение к коду:</label>
        <textarea class="form-control" rows="3">${block.explanation || ""}</textarea>
    `;

  expGroup.querySelector("textarea").addEventListener("input", (e) => {
    block.explanation = e.target.value;
  });

  editor.appendChild(langGroup);
  editor.appendChild(codeGroup);
  editor.appendChild(expGroup);

  container.appendChild(editor);
}

// Рендеринг редактора теста
function renderQuizEditor(container, block, index) {
  const editor = document.createElement("div");

  // Убедимся, что questions - массив
  if (!block.questions || !Array.isArray(block.questions)) {
    block.questions = [["Вопрос 1?", "Ответ 1"]];
  }

  const questionsContainer = document.createElement("div");
  questionsContainer.id = `quiz-questions-${index}`;

  // Рендерим вопросы
  block.questions.forEach((question, qIndex) => {
    addQuizQuestionRow(questionsContainer, block, question, qIndex);
  });

  editor.appendChild(questionsContainer);

  // Кнопка добавления вопроса
  const addQuestionBtn = document.createElement("button");
  addQuestionBtn.type = "button";
  addQuestionBtn.className = "add-question-btn";
  addQuestionBtn.innerHTML = "➕ <span>Добавить вопрос</span>";
  addQuestionBtn.addEventListener("click", () => {
    const newQuestion = ["Новый вопрос?", "Ответ"];
    block.questions.push(newQuestion);
    addQuizQuestionRow(
      questionsContainer,
      block,
      newQuestion,
      block.questions.length - 1,
    );
  });

  editor.appendChild(addQuestionBtn);
  container.appendChild(editor);
}

// Добавление строки вопроса теста
function addQuizQuestionRow(container, block, question, qIndex) {
  const questionDiv = document.createElement("div");
  questionDiv.className = "question-editor";

  // Вопрос
  const questionGroup = document.createElement("div");
  questionGroup.className = "form-group";
  questionGroup.innerHTML = `
        <label class="form-label">Вопрос ${qIndex + 1}:</label>
        <textarea class="form-control question-input" rows="2" 
                  placeholder="Введите вопрос">${question[0] || ""}</textarea>
    `;

  // Ответ
  const answerGroup = document.createElement("div");
  answerGroup.className = "form-group";
  answerGroup.innerHTML = `
        <label class="form-label">Ответ ${qIndex + 1}:</label>
        <textarea class="form-control answer-input" rows="2" 
                  placeholder="Введите ответ">${question[1] || ""}</textarea>
    `;

  // Кнопка удаления
  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "delete-question-btn";
  deleteBtn.textContent = "Удалить этот вопрос";

  questionDiv.appendChild(questionGroup);
  questionDiv.appendChild(answerGroup);
  questionDiv.appendChild(deleteBtn);
  container.appendChild(questionDiv);

  // Обработчики событий
  questionGroup.querySelector("textarea").addEventListener("input", (e) => {
    block.questions[qIndex][0] = e.target.value;
  });

  answerGroup.querySelector("textarea").addEventListener("input", (e) => {
    block.questions[qIndex][1] = e.target.value;
  });

  deleteBtn.addEventListener("click", () => {
    questionDiv.remove();
    block.questions.splice(qIndex, 1);
    // Обновляем индексы оставшихся вопросов
    container.querySelectorAll(".question-editor").forEach((div, idx) => {
      const label = div.querySelector(".form-label");
      if (label) label.textContent = `Вопрос ${idx + 1}:`;
      const answerLabel =
        div.querySelector(".answer-input")?.previousElementSibling;
      if (answerLabel) answerLabel.textContent = `Ответ ${idx + 1}:`;
    });
  });
}

// Рендеринг редактора диаграммы
function renderMermaidEditor(container, block, index) {
  const editor = document.createElement("div");

  // Название
  const titleGroup = document.createElement("div");
  titleGroup.className = "form-group";
  titleGroup.innerHTML = `
        <label class="form-label">Название диаграммы:</label>
        <input type="text" class="form-control" 
               value="${block.title || ""}" 
               placeholder="Введите название диаграммы">
    `;

  titleGroup.querySelector("input").addEventListener("input", (e) => {
    block.title = e.target.value;
  });

  // Код Mermaid
  const codeGroup = document.createElement("div");
  codeGroup.className = "form-group";
  codeGroup.innerHTML = `
        <label class="form-label">Код Mermaid:</label>
        <textarea class="text-editor" style="font-family: monospace; min-height: 150px;">${block.mermaid_code || ""}</textarea>
    `;

  codeGroup.querySelector("textarea").addEventListener("input", (e) => {
    block.mermaid_code = e.target.value;
  });

  // Пояснение
  const expGroup = document.createElement("div");
  expGroup.className = "form-group";
  expGroup.innerHTML = `
        <label class="form-label">Пояснение к диаграмме:</label>
        <textarea class="form-control" rows="3">${block.explanation || ""}</textarea>
    `;

  expGroup.querySelector("textarea").addEventListener("input", (e) => {
    block.explanation = e.target.value;
  });

  editor.appendChild(titleGroup);
  editor.appendChild(codeGroup);
  editor.appendChild(expGroup);

  container.appendChild(editor);
}

// Управление блоками
function moveBlockUp(index) {
  if (index > 0) {
    const blocks = courseData.content_blocks;
    [blocks[index], blocks[index - 1]] = [blocks[index - 1], blocks[index]];
    renderContentBlocks();
  }
}

function moveBlockDown(index) {
  const blocks = courseData.content_blocks;
  if (index < blocks.length - 1) {
    [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
    renderContentBlocks();
  }
}

function deleteBlock(index) {
  if (confirm("Удалить этот блок?")) {
    const blocks = courseData.content_blocks;
    blocks.splice(index, 1);
    renderContentBlocks();
  }
}

function addBlockBelow(index, type) {
  const newBlock = createEmptyBlock(type);
  const blocks = courseData.content_blocks;
  blocks.splice(index + 1, 0, newBlock);
  renderContentBlocks();
}

function addNewBlock(type) {
  const newBlock = createEmptyBlock(type);
  const blocks = courseData.content_blocks;
  blocks.push(newBlock);
  renderContentBlocks();
}

// Модальное окно выбора типа блока
function showBlockTypeModal(callback = null) {
  onTypeSelectCallback = callback;
  const modal = document.getElementById("blockTypeModal");
  if (modal) {
    modal.style.display = "flex";
  } else {
    console.error("Модальное окно не найдено");
  }
}

function hideBlockTypeModal() {
  const modal = document.getElementById("blockTypeModal");
  if (modal) {
    modal.style.display = "none";
  }
  onTypeSelectCallback = null;
}

// Экспорт JSON
function exportJSON() {
  try {
    const jsonStr = JSON.stringify(courseData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "course-data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Показать уведомление
    const exportBtn = document.getElementById("exportBtn");
    const originalText = exportBtn.textContent;
    exportBtn.textContent = "✓ Экспортировано";
    exportBtn.style.background = "#38a169";

    setTimeout(() => {
      exportBtn.textContent = originalText;
      exportBtn.style.background = "#48bb78";
    }, 2000);
  } catch (error) {
    console.error("Ошибка экспорта:", error);
    alert("Ошибка при экспорте данных");
  }
}

// Настройка обработчиков событий
function setupEventListeners() {
  // Кнопка экспорта
  const exportBtn = document.getElementById("exportBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", exportJSON);
  }

  // Модальное окно выбора типа блока
  document.querySelectorAll("#blockTypeModal [data-type]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const type = e.target.closest("[data-type]").dataset.type;
      if (onTypeSelectCallback) {
        onTypeSelectCallback(type);
      }
      hideBlockTypeModal();
    });
  });

  // Кнопка отмены в модальном окне
  const cancelBtn = document.getElementById("cancelBlockType");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", hideBlockTypeModal);
  }
}

// Скрытие индикатора загрузки
function hideLoading() {
  const loading = document.getElementById("loading");
  if (loading) {
    loading.style.display = "none";
  }
}

// Показать ошибку
function showError(message) {
  const app = document.getElementById("app");
  app.innerHTML = `
        <div class="error-message">
            <h3>Ошибка</h3>
            <p>${message}</p>
            <button onclick="location.reload()" style="padding: 8px 16px; margin-top: 10px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;">
                Перезагрузить страницу
            </button>
        </div>
    `;
}

// Запуск админ-панели
document.addEventListener("DOMContentLoaded", initAdmin);
