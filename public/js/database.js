$(document).ready(function () {
  // Initialize database
  function initDb() {
    $.get('http://localhost:3000/init-db')
      .done(function (data) {
        console.log(data);
        alert('Database initialized successfully');
      })
      .fail(function (jqXHR) {
        alert(`Error initializing database: ${jqXHR.responseText}`);
      });
  }

  // Drop tables
  function dropTables() {
    $.get('http://localhost:3000/drop-tables')
      .done(function (data) {
        console.log(data);
        alert('Tables dropped successfully');
      })
      .fail(function (jqXHR) {
        alert(`Error dropping tables: ${jqXHR.responseText}`);
      });
  }

  // Attach event handlers (as examples)
  $('#init-db-btn').click(function () {
    initDb();
  });

  $('#drop-tables-btn').click(function () {
    dropTables();
  });
});
