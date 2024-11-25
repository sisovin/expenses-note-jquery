$(document).ready(function () {
  const API_BASE = 'http://localhost:3000';

  function fetchCategories() {
    $.get(`${API_BASE}/categories`, function (data) {
      $('#category').empty();
      data.forEach((category) => {
        $('#category').append(
          `<option value="${category.id}">${category.name}</option>`
        );
      });
    }).fail(function (jqXHR, textStatus, errorThrown) {
      console.error('Error fetching categories:', textStatus, errorThrown);
    });
  }

  function fetchExpenses() {
    $.get(`${API_BASE}/expenses`, function (data) {
      $('#expenseTable').empty();
      data.forEach((expense) => {
        $('#expenseTable').append(`
          <tr>
            <td>${expense.description}</td>
            <td>${expense.amount}</td>
            <td>${expense.category_name}</td>
            <td>${expense.date}</td>
            <td><button class="btn btn-warning btn-sm" onclick="updateExpense(${expense.id})">Edit</button></td>
            <td><button class="btn btn-danger btn-sm" onclick="deleteExpense(${expense.id})">Delete</button></td>
          </tr>
        `);
      });
    }).fail(function (jqXHR, textStatus, errorThrown) {
      console.error('Error fetching expenses:', textStatus, errorThrown);
    });
  }

  $('#expenseForm').on('submit', function (e) {
    e.preventDefault();
    const description = $('#description').val();
    const amount = $('#amount').val();
    const category_id = $('#category').val();
    const date = $('#date').val();

    $.ajax({
      url: `${API_BASE}/expenses`,
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        description,
        amount,
        category_id,
        date,
      }),
      success: function () {
        $('#description').val('');
        $('#amount').val('');
        $('#category').val('');
        $('#date').val('');
        fetchExpenses();
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error('Error adding expense:', textStatus, errorThrown);
      },
    });
  });

  window.updateExpense = function (id) {
    window.location.href = `update_expense.html?id=${id}`;
  };

  window.deleteExpense = function (id) {
    $.ajax({
      url: `${API_BASE}/expenses/${id}`,
      type: 'DELETE',
      success: function () {
        fetchExpenses();
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error('Error deleting expense:', textStatus, errorThrown);
      },
    });
  };

  fetchCategories();
  fetchExpenses();
});
