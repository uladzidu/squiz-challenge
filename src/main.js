import './style.scss';

(function () {
  const API_URL = 'https://dujour.squiz.cloud/developer-challenge/data';

  const countrySelect = document.getElementById('country-select');
  const industrySelect = document.getElementById('industry-select');
  const sortBy = document.getElementById('sort-by');
  const sortDirection = document.getElementById('sort-direction');
  const companyList = document.getElementById('company-list');

  let companies = [];
  let filteredCompanies = [];

  async function fetchData() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      companies = data;
      populateFilters();
      applyFiltersAndSort();
    } catch (err) {
      companyList.innerHTML = `<li>Error loading data: ${err.message}</li>`;
    }
  }

  const appendOptions = (selectElement, items) => {
    items.forEach((item) => {
      const option = document.createElement('option');
      option.value = item;
      option.textContent = item;
      selectElement.appendChild(option);
    });
  };

  function populateFilters() {
    const countries = [...new Set(companies.map((d) => d.country))].sort();
    const industries = [...new Set(companies.map((d) => d.industry))].sort();

    appendOptions(countrySelect, countries);
    appendOptions(industrySelect, industries);
  }

  function applyFiltersAndSort() {
    const selectedCountry = countrySelect.value;
    const selectedIndustry = industrySelect.value;
    const sortValue = sortBy.value;
    const directionValue = sortDirection.value;

    function matchesFilters(company, countryFilter, industryFilter) {
      const countryMatches =
        !countryFilter || company.country === countryFilter;
      const industryMatches =
        !industryFilter || company.industry === industryFilter;
      return countryMatches && industryMatches;
    }

    filteredCompanies = companies.filter((company) =>
      matchesFilters(company, selectedCountry, selectedIndustry),
    );

    filteredCompanies.sort((a, b) => {
      let aValue = a[sortValue];
      let bValue = b[sortValue];

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return directionValue === 'asc' ? -1 : 1;
      if (aValue > bValue) return directionValue === 'asc' ? 1 : -1;
      return 0;
    });

    renderList();
  }

  function renderList() {
    if (filteredCompanies.length === 0) {
      companyList.innerHTML = '<li>No results found.</li>';
      return;
    }

    companyList.innerHTML = filteredCompanies
      .map(
        (d) => `
        <li>
          <strong>${d.name}</strong><br />
          Country: ${d.country}<br />
          Industry: ${d.industry}<br />
          Employees: ${d.numberOfEmployees}
        </li>
      `,
      )
      .join('');
  }

  document
    .querySelectorAll('.filter-control')
    .forEach((el) => el.addEventListener('change', applyFiltersAndSort));

  fetchData();
})();
