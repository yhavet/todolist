// js/app.js
document.addEventListener("DOMContentLoaded", function () {
  
  // --- URL DE LA API ---
  const API_URL_BASE = 'http://localhost/lista/api/';

  // --- SELECTORES DEL DOM (TAREAS) ---
  const userGreeting = document.getElementById("user-greeting");
  const avatarLetter = document.getElementById("avatar-letter");
  const logoutBtn = document.getElementById("logout-btn");
  const currentDate = document.getElementById("current-date");
  const toggleInputsBtn = document.getElementById("toggle-inputs");
  const taskInputContainer = document.querySelector(".task-input");
  const addTaskBtn = document.getElementById("add-task");
  const exportBtn = document.getElementById("export-btn");
  const inProgressTasksContainer = document.getElementById("in-progress-tasks");
  const completedTasksContainer = document.getElementById("completed-tasks");
  const viewToggleBtn = document.getElementById("view-toggle-btn");
  const inProgressColumn = document.getElementById("in-progress-column");
  const completedColumn = document.getElementById("completed-column");

  // Inputs del formulario de TAREAS
  const taskTitle = document.getElementById("task-title");
  const taskDescription = document.getElementById("task-description");
  const categoryInput = document.getElementById("category");
  const dueDate = document.getElementById("due-date");
  const taskStartTimeInput = document.getElementById('task-start-time');
  const taskEndTimeInput = document.getElementById('task-end-time');

  // --- SELECTORES DEL DOM (REUNIONES) ---
  const toggleMeetingBtn = document.getElementById("toggle-meeting-btn");
  const meetingInputContainer = document.querySelector(".meeting-input");
  const addMeetingBtn = document.getElementById("add-meeting-btn");
  const meetingsContainer = document.getElementById("meetings-container");

  // Inputs del formulario de REUNIONES
  const meetingTitle = document.getElementById("meeting-title");
  const meetingNotes = document.getElementById("meeting-notes");
  const meetingDate = document.getElementById("meeting-date");
  const meetingHours = document.getElementById("meeting-hours");
  const meetingMinutes = document.getElementById("meeting-minutes");

  
  let showingInProgress = true;
  
  // --- INICIALIZACIÓN ---
  if(completedColumn) completedColumn.classList.add("is-hidden");
  checkSession();
  if(currentDate) currentDate.textContent = getCurrentDate();
  
  const savedUser = localStorage.getItem('taskMasterUser');
  if (savedUser) {
      if(userGreeting) userGreeting.textContent = savedUser;
      if (avatarLetter) {
          avatarLetter.textContent = savedUser.charAt(0).toUpperCase();
      }
  }
  
  loadTasksFromDB();
  loadMeetingsFromDB();


  // --- MANEJO DE SESIÓN ---
  async function checkSession() {
    try {
      const response = await fetch(API_URL_BASE + 'check_session.php');
      const session = await response.json();
      if (!session.loggedIn) {
        alert('Debes iniciar sesión para ver esta página.');
        window.location.href = 'index.html';
      }
    } catch (error) {
      // alert('Error de conexión. Asegúrate de que XAMPP esté corriendo.');
      // window.location.href = 'index.html';
      console.error(error);
    }
  }

  if(logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await fetch(API_URL_BASE + 'logout.php');
      localStorage.removeItem('taskMasterUser');
      alert('Sesión cerrada.');
      window.location.href = 'index.html';
    });
  }

  
  // --- MANEJO DE VISTAS (TAREAS) ---
  if(viewToggleBtn) {
    viewToggleBtn.addEventListener('click', () => {
        showingInProgress = !showingInProgress;
        if (showingInProgress) {
            inProgressColumn.classList.remove('is-hidden');
            completedColumn.classList.add('is-hidden');
            viewToggleBtn.textContent = 'Ver Tareas Completadas';
        } else {
            inProgressColumn.classList.add('is-hidden');
            completedColumn.classList.remove('is-hidden');
            viewToggleBtn.textContent = 'Ver Tareas en Progreso';
        }
    });
  }


  // --- MANEJO DE REUNIONES ---
  if(toggleMeetingBtn) {
    toggleMeetingBtn.addEventListener("click", function () {
      meetingInputContainer.classList.toggle("hidden");
      if (meetingInputContainer.classList.contains("hidden")) {
        toggleMeetingBtn.textContent = "+ Añadir Reunión (Daily/Call)";
      } else {
        toggleMeetingBtn.textContent = "Cerrar formulario de reunión";
        if(meetingDate) meetingDate.valueAsDate = new Date(); 
      }
    });
  }

  if(addMeetingBtn) {
    addMeetingBtn.addEventListener("click", async () => {
      const hours = parseInt(meetingHours.value) || 0;
      const minutes = parseInt(meetingMinutes.value) || 0;
      const totalDuration = (hours * 60) + minutes;

      const meetingData = {
        title: meetingTitle.value.trim(),
        notes: meetingNotes.value.trim(),
        date: meetingDate.value,
        duration: totalDuration,
      };

      if (meetingData.title && meetingData.date && meetingData.duration > 0) {
        try {
          const response = await fetch(API_URL_BASE + 'create_meeting.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(meetingData)
          });
          if (response.ok) {
            // Recargamos para mantener el orden y agrupación
            loadMeetingsFromDB();
            
            meetingTitle.value = '';
            meetingNotes.value = '';
            meetingHours.value = '';
            meetingMinutes.value = '';
            meetingInputContainer.classList.add("hidden");
            toggleMeetingBtn.textContent = "+ Añadir Reunión (Daily/Call)";
          } else {
            alert('Error al guardar la reunión.');
          }
        } catch (error) {
          console.error('Error de red:', error);
        }
      } else {
          alert('Por favor, completa el título, la fecha y una duración válida.');
      }
    });
  }

  // (MODIFICADO) Cargar Reuniones con Agrupación por Fecha
  async function loadMeetingsFromDB() {
    if(!meetingsContainer) return;
    try {
      const response = await fetch(API_URL_BASE + 'get_meetings.php');
      const meetings = await response.json();
      
      meetingsContainer.innerHTML = '';
      let lastDateMeeting = null;

      meetings.forEach(meetingData => {
        const meetingElement = createMeetingElement(meetingData);
        
        // Usamos la misma lógica de agrupación que en tareas
        const dateLabel = getDateLabel(meetingData.meeting_date);

        if (dateLabel !== lastDateMeeting) {
            addDateHeader(meetingsContainer, dateLabel);
            lastDateMeeting = dateLabel;
        }

        meetingsContainer.appendChild(meetingElement);
      });
    } catch (error) {
      console.error('Error al cargar reuniones:', error);
    }
  }

  function createMeetingElement(meetingData) {
    const card = document.createElement("div");
    card.classList.add("meeting-card");
    card.dataset.id = meetingData.id;

    const durationString = formatDuration(meetingData.duration_minutes);

    card.innerHTML = `
      <div class="details">
        <h3>${meetingData.title}</h3>
        <p>${meetingData.notes || '<i>Sin notas</i>'}</p>
        <p><strong>Duración:</strong> ${durationString}</p>
      </div>
      <div class="actions">
        <button class="delete-meeting-btn" title="Eliminar reunión">❌</button>
      </div>
    `;

    const deleteBtn = card.querySelector(".delete-meeting-btn");
    if(deleteBtn) {
        deleteBtn.addEventListener("click", async () => {
            if (confirm('¿Estás seguro de que quieres ELIMINAR esta reunión?')) {
                await fetch(`${API_URL_BASE}delete_meeting.php?id=${meetingData.id}`);
                // Recargamos para limpiar cabeceras vacías si fuera necesario
                loadMeetingsFromDB();
            }
        });
    }

    return card;
  }
  
  function formatDuration(totalMinutes) {
      if (!totalMinutes || totalMinutes <= 0) return 'No especificada';
      
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      
      let str = '';
      if (hours > 0) str += `${hours}h `;
      if (minutes > 0) str += `${minutes}m`;
      
      return str.trim();
  }


  // --- MANEJO DE TAREAS ---
  if(toggleInputsBtn) {
    toggleInputsBtn.addEventListener("click", function () {
      taskInputContainer.classList.toggle("hidden");
      if (taskInputContainer.classList.contains("hidden")) {
        toggleInputsBtn.textContent = "+ Crear nueva tarea";
      } else {
        toggleInputsBtn.textContent = "Cerrar formulario";
      }
    });
  }

  if(addTaskBtn) {
    addTaskBtn.addEventListener("click", async () => {
      const taskData = {
        title: taskTitle.value.trim(),
        description: taskDescription.value.trim(),
        category: categoryInput.value,
        date: dueDate.value,
        startTime: taskStartTimeInput.value || null,
        endTime: taskEndTimeInput.value || null,
      };
      if (taskData.title && taskData.description && taskData.category && taskData.date) {
        try {
          const response = await fetch(API_URL_BASE + 'create_task.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
          });
          if (response.ok) {
            // Recargar todo para mantener orden y agrupación correcta
            loadTasksFromDB();
            
            clearForm();
            taskInputContainer.classList.add("hidden");
            toggleInputsBtn.textContent = "+ Crear nueva tarea";
          } else {
            alert('Error al guardar la tarea en el servidor PHP.');
          }
        } catch (error) {
          console.error('Error de red:', error);
        }
      }
    });
  }

  // (MODIFICADO) Cargar Tareas con Agrupación por Fecha
  async function loadTasksFromDB() {
    if(!inProgressTasksContainer || !completedTasksContainer) return;
    try {
      const response = await fetch(API_URL_BASE + 'get_tasks.php');
      const tasks = await response.json();
      
      inProgressTasksContainer.innerHTML = '';
      completedTasksContainer.innerHTML = '';

      let lastDateInProgress = null;
      let lastDateCompleted = null;

      tasks.forEach(taskData => {
        const taskElement = createTaskElement(taskData);
        
        const dateLabel = getDateLabel(taskData.due_date);

        if (taskData.completed == "1") {
          if (dateLabel !== lastDateCompleted) {
            addDateHeader(completedTasksContainer, dateLabel);
            lastDateCompleted = dateLabel;
          }
          completedTasksContainer.appendChild(taskElement);
        } else {
          if (dateLabel !== lastDateInProgress) {
            addDateHeader(inProgressTasksContainer, dateLabel);
            lastDateInProgress = dateLabel;
          }
          inProgressTasksContainer.appendChild(taskElement);
        }
      });
    } catch (error) {
      console.error('Error al cargar tareas:', error);
    }
  }

  function createTaskElement(taskData) {
    const task = document.createElement("div");
    task.classList.add("task");
    task.dataset.id = taskData.id;
    if (taskData.completed == "1") {
      task.classList.add("completed");
    }
    let iconButtonsHTML = '';
    if (taskData.completed == "1") {
        iconButtonsHTML = `<button class="permanent-delete-btn" title="Borrar permanentemente">❌</button>`;
    } else {
        iconButtonsHTML = `
            <button class="complete-task" title="Completar">✔</button>
            <button class="delete-task" title="Archivar">❌</button>
        `;
    }
    
    // Formatear la fecha para visualización
    const dateObj = new Date(taskData.due_date + 'T00:00:00');
    const dateFormatted = dateObj.toLocaleDateString('es-ES');

    task.innerHTML = `
      <div class="task-details">
        <h3>${taskData.title}</h3>
        <p>${taskData.description}</p>
        ${taskData.start_time && taskData.end_time ? `<p class="task-time">De: ${taskData.start_time} a ${taskData.end_time}</p>` : ''}
        <p><strong>Fecha límite:</strong> ${dateFormatted}</p>
        <p><strong>Categoría:</strong> ${taskData.category}</p>
      </div>
      <div class="icons">
        ${iconButtonsHTML}
      </div>
    `;
    task.style.borderLeftColor = getCategoryColor(taskData.category);
    
    const completeBtn = task.querySelector(".complete-task");
    if (completeBtn) {
        completeBtn.addEventListener("click", async () => {
          await fetch(`${API_URL_BASE}complete_task.php?id=${taskData.id}`);
          loadTasksFromDB();
        });
    }

    const archiveBtn = task.querySelector(".delete-task");
    if (archiveBtn) {
        archiveBtn.addEventListener("click", async () => {
          if (confirm('¿Estás seguro de que quieres ARCHIVAR esta tarea?')) {
            await fetch(`${API_URL_BASE}delete_task.php?id=${taskData.id}`);
            task.remove(); 
            loadTasksFromDB();
          }
        });
    }

    const permanentDeleteBtn = task.querySelector(".permanent-delete-btn");
    if (permanentDeleteBtn) {
        permanentDeleteBtn.addEventListener("click", async () => {
          if (confirm('¿Estás seguro de que quieres borrar esta tarea PERMANENTEMENTE? Esta acción no se puede deshacer.')) {
            await fetch(`${API_URL_BASE}permanent_delete.php?id=${taskData.id}`);
            task.remove();
            loadTasksFromDB();
          }
        });
    }
    return task;
  }
  
  function clearForm() {
    if(taskTitle) taskTitle.value = '';
    if(taskDescription) taskDescription.value = '';
    if(categoryInput) categoryInput.value = 'Urgente';
    if(dueDate) dueDate.value = '';
    if(taskStartTimeInput) taskStartTimeInput.value = '';
    if(taskEndTimeInput) taskEndTimeInput.value = '';
  }

  // --- EXPORTAR ---
  if(exportBtn) {
    exportBtn.addEventListener("click", function() {
        exportTasksToCSV();
    });
  }
  function exportTasksToCSV() {
    const tasksToExport = showingInProgress ? 
      document.querySelectorAll('#in-progress-column .task') :
      document.querySelectorAll('#completed-column .task');
    if (tasksToExport.length === 0) {
      alert('No hay tareas en esta vista para exportar.');
      return;
    }
    let csvContent = "data:text/csv;charset=utf-8,Titulo,Descripcion,Estado,Categoria,Fecha Limite,Hora\n";
    tasksToExport.forEach(task => {
        const title = task.querySelector('h3').textContent.replace(/,/g, '');
        const description = task.querySelector('p').textContent.replace(/,/g, '');
        const status = task.classList.contains('completed') ? 'Completada' : 'En Progreso';
        
        // Extracción más robusta
        let category = "N/A";
        let date = "N/A";
        let time = "";
        
        // Buscar dentro de los párrafos
        const ps = task.querySelectorAll('p');
        ps.forEach(p => {
            if(p.textContent.includes('Categoría:')) category = p.textContent.split(': ')[1];
            if(p.textContent.includes('Fecha límite:')) date = p.textContent.split(': ')[1];
            if(p.classList.contains('task-time')) time = p.textContent;
        });

        const row = `"${title}","${description}","${status}","${category}","${date}","${time}"\n`;
        csvContent += row;
    });
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const fileName = showingInProgress ? 'Tareas_EnProgreso.csv' : 'Tareas_Completadas.csv';
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // --- FUNCIONES UTILITARIAS ---
  function getCurrentDate() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return today.toLocaleDateString('es-ES', options);
  }
  
  function getCategoryColor(category) {
    if(!category) return "#9e9e9e";
    switch (category.toLowerCase()) {
      case "urgente": return "#f44336";
      case "normal": return "#ff9800";
      case "baja": return "#4caf50";
      default: return "#9e9e9e";
    }
  }

  // --- FUNCIONES PARA SEPARADORES DE FECHA ---
  
  function addDateHeader(container, text) {
    const header = document.createElement("h4");
    header.textContent = text;
    header.style.marginTop = "20px";
    header.style.marginBottom = "10px";
    header.style.color = "#8a8a8e"; 
    header.style.fontSize = "14px";
    header.style.fontWeight = "600";
    header.style.textTransform = "uppercase";
    header.style.borderBottom = "1px solid #e5e5ea";
    header.style.paddingBottom = "5px";
    container.appendChild(header);
  }

  function getDateLabel(dateString) {
    if (!dateString) return "Sin fecha";

    const dateParts = dateString.split('-');
    const taskDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (taskDate.getTime() === today.getTime()) {
      return "Hoy";
    } else if (taskDate.getTime() === yesterday.getTime()) {
      return "Ayer";
    } else if (taskDate.getTime() === tomorrow.getTime()) {
      return "Mañana";
    } else {
      const options = { weekday: 'long', day: 'numeric', month: 'long' };
      const label = taskDate.toLocaleDateString('es-ES', options);
      return label.charAt(0).toUpperCase() + label.slice(1);
    }
  }
});

// --- NUEVAS FUNCIONES CORREGIDAS ---

  function addDateHeader(container, text) {
    const header = document.createElement("h4");
    header.textContent = text; // Ahora mostrará "Miércoles 19", etc.
    header.style.marginTop = "25px";
    header.style.marginBottom = "10px";
    header.style.color = "#1d1d1f";
    header.style.fontSize = "15px";
    header.style.fontWeight = "700";
    header.style.textTransform = "capitalize"; // Para que la primera letra sea mayúscula
    header.style.borderBottom = "2px solid #e5e5ea";
    header.style.paddingBottom = "5px";
    container.appendChild(header);
  }

  function getDateLabel(dateString) {
    if (!dateString) return "Sin fecha";

    // Parsear fecha (Año, Mes-1, Día)
    const dateParts = dateString.split('-');
    const taskDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Si es HOY, lo mantenemos como "Hoy" (es lo más útil)
    // Si prefieres que diga "Jueves 20" también, borra este if.
    if (taskDate.getTime() === today.getTime()) {
      return "Hoy"; 
    }

    // FORMATO SOLICITADO: "Miércoles 19"
    const options = { weekday: 'long', day: 'numeric' }; 
    // Esto devuelve algo como "miércoles, 19" o "miércoles 19"
    const label = taskDate.toLocaleDateString('es-ES', options);
    
    // Quitamos la coma si el navegador la pone (ej: "miércoles, 19" -> "miércoles 19")
    const cleanLabel = label.replace(',', '');

    // Capitalizar primera letra (miércoles -> Miércoles)
    return cleanLabel.charAt(0).toUpperCase() + cleanLabel.slice(1);
  }

  // PEQUEÑO TRUCO: Cambiar el título "Dailies y Calls de Hoy" por algo genérico
  // Agrega esto dentro de tu addEventListener inicial o al cargar reuniones:
  const meetingsHeaderTitle = document.querySelector('.meeting-list h2');
  if(meetingsHeaderTitle) {
      meetingsHeaderTitle.textContent = "Mis Reuniones y Dailies";
  }