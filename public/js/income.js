$(document).ready(function () {
  const API_BASE = 'http://localhost:3000';

  function fetchIncomes() {
    $.get(`${API_BASE}/incomes`, function (data) {
      $('#incomeTable').empty();
      let totalAmount = 0;
      data.forEach((income) => {
        totalAmount += income.amount;
        $('#incomeTable').append(`
          <tr>
            <td>${income.name}</td>
            <td>${income.amount.toFixed(2)}</td>
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
      $('#totalAmount').text(totalAmount.toFixed(2));
    }).fail(function (jqXHR, textStatus, errorThrown) {
      console.error('Error fetching incomes:', textStatus, errorThrown);
    });
  }

  $('#incomeForm').on('submit', function (e) {
    e.preventDefault();
    const name = $('#name').val();
    const amount = parseFloat($('#amount').val()).toFixed(2);
    const date = $('#date').val();

    $.ajax({
      url: `${API_BASE}/incomes`,
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ name, amount, date }),
      success: function () {
        $('#name').val('');
        $('#amount').val('');
        $('#date').val('');
        fetchIncomes();
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error('Error adding income:', textStatus, errorThrown);
      },
    });
  });

  window.editIncome = function (id, name, amount, date) {
    const newName = prompt('Enter new name for the income:', name);
    const newAmount = prompt(
      'Enter new amount for the income:',
      amount.toFixed(2)
    );
    const newDate = prompt('Enter new date for the income:', date);
    if (newName && newAmount && newDate) {
      $.ajax({
        url: `${API_BASE}/incomes/${id}`,
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify({
          name: newName,
          amount: parseFloat(newAmount).toFixed(2),
          date: newDate,
        }),
        success: function () {
          fetchIncomes();
        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.error('Error updating income:', textStatus, errorThrown);
        },
      });
    }
  };

  window.deleteIncome = function (id) {
    if (confirm('Are you sure you want to delete this income?')) {
      $.ajax({
        url: `${API_BASE}/incomes/${id}`,
        type: 'DELETE',
        success: function () {
          fetchIncomes();
        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.error('Error deleting income:', textStatus, errorThrown);
        },
      });
    }
  };

  fetchIncomes();
});
