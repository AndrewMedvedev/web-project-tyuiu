function addNewBlock(type) {
  const newBlock = createEmptyBlock(type);
  blocksData.push(newBlock);
  renderBlocks();
  markAsModified();

  // Прокрутка к новому блоку
  const container = document.getElementById("blocksContainer");
  const lastBlock = container.lastElementChild;
  if (lastBlock) {
    lastBlock.scrollIntoView({ behavior: "smooth" });
  }
}

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
      code: "print('Hello, World!')",
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

function addBlockAbove(index) {
  showBlockTypeModal((type) => {
    const newBlock = createEmptyBlock(type);
    blocksData.splice(index, 0, newBlock);
    renderBlocks();
    markAsModified();
  });
}

function addBlockBelow(index) {
  showBlockTypeModal((type) => {
    const newBlock = createEmptyBlock(type);
    blocksData.splice(index + 1, 0, newBlock);
    renderBlocks();
    markAsModified();
  });
}

// Модальное окно выбора типа блока
let onTypeSelectCallback = null;

function showBlockTypeModal(callback = null) {
  onTypeSelectCallback = callback;
  document.getElementById("blockTypeModal").style.display = "flex";
}

function hideBlockTypeModal() {
  document.getElementById("blockTypeModal").style.display = "none";
  onTypeSelectCallback = null;
}

// Обработка выбора типа блока
document.querySelectorAll("#blockTypeModal [data-type]").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const type = e.target.closest("[data-type]").dataset.type;
    if (onTypeSelectCallback) {
      onTypeSelectCallback(type);
    } else {
      addNewBlock(type);
    }
    hideBlockTypeModal();
  });
});

function deleteBlock(index) {
  if (confirm("Удалить этот блок?")) {
    blocksData.splice(index, 1);
    renderBlocks();
    markAsModified();
  }
}
