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
      let totalExpenseAmount = 0;
      data.forEach((expense) => {
        totalExpenseAmount += parseFloat(expense.amount);
        $('#expenseTable').append(`
          <tr>
            <td>${expense.description}</td>
            <td>${parseFloat(expense.amount).toFixed(2)}</td>
            <td>${expense.category_name}</td>
            <td>${expense.date}</td>
            <td><button class="btn btn-warning btn-sm" onclick="updateExpense(${
              expense.id
            })">Edit</button></td>
            <td><button class="btn btn-danger btn-sm" onclick="deleteExpense(${
              expense.id
            })">Delete</button></td>
          </tr>
        `);
      });
      $('#totalExpenseAmount').text(totalExpenseAmount.toFixed(2));
      calculateBalanceAndNetIncome();
    }).fail(function (jqXHR, textStatus, errorThrown) {
      console.error('Error fetching expenses:', textStatus, errorThrown);
    });
  }

  function fetchIncomes() {
    $.get(`${API_BASE}/incomes`, function (data) {
      $('#incomeTable').empty();
      let totalIncomeAmount = 0;
      data.forEach((income) => {
        totalIncomeAmount += parseFloat(income.amount);
        $('#incomeTable').append(`
          <tr>
            <td>${income.name}</td>
            <td>${parseFloat(income.amount).toFixed(2)}</td>
            <td>${income.date}</td>
            <td>
              <button class="btn btn-warning btn-sm" onclick="editIncome(${
                income.id
              }, '${income.name}', ${income.amount}, '${
          income.date
        }')">Edit</button>
              <button class="btn btn-danger btn-sm" onclick="deleteIncome(${
                income.id
              })">Delete</button>
            </td>
          </tr>
        `);
      });
      $('#totalIncomeAmount').text(totalIncomeAmount.toFixed(2));
      calculateBalanceAndNetIncome();
    }).fail(function (jqXHR, textStatus, errorThrown) {
      console.error('Error fetching incomes:', textStatus, errorThrown);
    });
  }

  function calculateBalanceAndNetIncome() {
    const totalIncome = parseFloat($('#totalIncomeAmount').text()) || 0;
    const totalExpense = parseFloat($('#totalExpenseAmount').text()) || 0;
    const balance = totalIncome - totalExpense;
    const netIncome = totalIncome - totalExpense;

    $('#balance').text(balance.toFixed(2));
    $('#netIncome').text(netIncome.toFixed(2));
  }

  $('#expenseForm').on('submit', function (e) {
    e.preventDefault();
    const description = $('#description').val();
    const amount = parseFloat($('#amount').val()).toFixed(2);
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
  fetchIncomes();
});
