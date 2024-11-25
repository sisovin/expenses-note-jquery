$(document).ready(function () {
  const API_BASE = 'http://localhost:3000';
  const urlParams = new URLSearchParams(window.location.search);
  const expenseId = urlParams.get('id');

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

  function fetchExpenseDetails() {
    $.get(`${API_BASE}/expenses/${expenseId}`, function (data) {
      $('#description').val(data.description);
      $('#amount').val(data.amount);
      $('#category').val(data.category_id);
      $('#date').val(data.date);
    }).fail(function (jqXHR, textStatus, errorThrown) {
      console.error('Error fetching expense details:', textStatus, errorThrown);
    });
  }

  $('#updateExpenseForm').on('submit', function (e) {
    e.preventDefault();
    const description = $('#description').val();
    const amount = $('#amount').val();
    const category_id = $('#category').val();
    const date = $('#date').val();

    $.ajax({
      url: `${API_BASE}/expenses/${expenseId}`,
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify({
        description,
        amount,
        category_id,
        date,
      }),
      success: function () {
        window.location.href = 'index.html';
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error('Error updating expense:', textStatus, errorThrown);
      },
    });
  });

  fetchCategories();
  fetchExpenseDetails();
});
