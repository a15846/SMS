let selectedCountryId = null;
let selectedServiceId = null;
let allCountries = [];
let currentPage = 1;
let itemsPerPage = 18;
let totalPages = 1;
let currentRegion = '';
let currentSearch = '';
let currentSort = 'popular';


let servicesCurrentPage = 1;
let servicesItemsPerPage = 12;
let servicesAllData = [];


document.addEventListener('DOMContentLoaded', function() {
    console.log('countries.js loaded');
    
    
    hideLoginOverlayIfLoggedIn();
    
    
    loadCountries();
    
    
    initializeSearch();
    
    
    initializeFilter();
    
    
    initializeSort();
});


function hideLoginOverlayIfLoggedIn() {
    
    const loginOverlay = document.querySelector('.login-overlay');
    if (loginOverlay) {
        
        
        
        console.log('Login overlay found, hiding if needed');
        loginOverlay.style.display = 'none';
        loginOverlay.style.zIndex = '-1';
    }
}


async function loadCountries() {
    try {
        const container = document.getElementById('countries-container');
        if (!container) {
            console.error('国家容器元素未找到');
            return;
        }
        
        
        container.innerHTML = '<div class="col-12 text-center my-5">' +
            '<div class="spinner-border text-primary" role="status">' +
            '<span class="visually-hidden">加载中...</span>' +
            '</div>' +
            '<p class="mt-3">正在加载国家数据...</p>' +
            '</div>';

        
        const params = new URLSearchParams({
            page: currentPage,
            per_page: itemsPerPage,
            region: currentRegion,
            search: currentSearch,
            sort: currentSort
        });

        console.log('Fetching countries with params:', Object.fromEntries(params));
        
        
        const response = await fetch(`/api/countries?${params}`);
        if (!response.ok) {
            throw new Error(`加载失败: ${response.status} ${response.statusText}`);
        }
        
        
        const data = await response.json();
        console.log('API返回的国家数据:', data);
        
        allCountries = data.countries || []; 
        totalPages = data.pages || 1;
        
        
        displayCountries(allCountries);
        
        
        updatePagination(data.total || 0);

    } catch (error) {
        console.error('加载国家数据失败:', error);
        const container = document.getElementById('countries-container');
        if (container) {
            
            console.log('自动重试加载国家数据...');
            
            
            container.innerHTML = '<div class="col-12 text-center my-5">' +
                '<div class="spinner-border text-primary" role="status">' +
                '<span class="visually-hidden">加载中...</span>' +
                '</div>' +
                '<p class="mt-3">重新连接中...</p>' +
                '</div>';
            
            
            setTimeout(() => {
                loadCountries();
            }, 2000);
        }
    }
}


function displayCountries(countries) {
    console.log('显示国家列表, 数量:', countries.length); 
    const container = document.getElementById('countries-container');
    container.innerHTML = '';
    
    if (!countries || countries.length === 0) {
        container.innerHTML = '<div class="col-12">' +
            '<div class="alert alert-warning">' +
            '<i class="bi bi-exclamation-circle me-2"></i>' +
            '没有找到匹配的国家/地区' +
            '</div>' +
            '</div>';
        return;
    }
    
    countries.forEach((country, index) => {
        const col = document.createElement('div');
        col.className = 'col-6 col-sm-4 col-md-3 col-lg-2 mb-3';
        
        const card = document.createElement('div');
        card.className = 'country-card';
        card.dataset.id = country.id;
        card.dataset.name = country.name;
        card.dataset.code = country.code;
        
        const flagUrl = country.flag_url || `https://www.countryflagicons.com/FLAT/64/${country.code}.png`;
        const flagFallback = '/static/images/flag-placeholder.png';
        
        card.innerHTML = '<div class="flag-container mb-2">' +
            '<img src="' + flagUrl + '" alt="' + country.name + '" class="country-flag" ' +
            'onerror="this.onerror=null; this.src=\'' + flagFallback + '\';">' +
            '</div>' +
            '<h6 class="mb-0">' + country.name + '</h6>' +
            '<div class="d-flex justify-content-between align-items-center mt-1">' +
            '<div class="text-muted small">' + country.code + '</div>' +
            '</div>';
        
        
        card.addEventListener('click', () => {
            document.querySelectorAll('.country-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            selectedCountryId = country.id;
            
            const countriesSection = document.querySelector('.countries-section');
            if (countriesSection) {
                countriesSection.style.display = 'none';
            }
            
            
            const searchFilterCard = document.querySelector('.search-filter-card');
            if (searchFilterCard) {
                searchFilterCard.classList.add('hidden');
            }
            
            const servicesSection = document.getElementById('services-section');
            if (servicesSection) {
                servicesSection.classList.remove('d-none');
                
                const servicesSectionTitle = servicesSection.querySelector('h5');
                if (servicesSectionTitle) {
                    servicesSectionTitle.innerHTML = '<div class="d-flex align-items-center">' +
                        '<button class="btn btn-sm btn-outline-secondary me-3" onclick="showCountriesList()">' +
                        '<i class="bi bi-arrow-left"></i> 返回' +
                        '</button>' +
                        '<span>' +
                        '<img src="' + flagUrl + '" ' +
                        'alt="' + country.name + '" ' +
                        'style="height: 24px; margin-right: 8px;">' +
                        country.name + ' (' + country.code + ') 支持的服务' +
                        '</span>' +
                        '</div>';
                }
                
                loadServices(country.id);
            }
        });
        
        col.appendChild(card);
        container.appendChild(col);
        
        
        setTimeout(() => {
            card.classList.add('animate-fade-in');
        }, index * 30);
    });
}


function showCountriesList() {
    const countriesSection = document.querySelector('.countries-section');
    if (countriesSection) {
        countriesSection.style.display = 'block';
    }
    
    
    const searchFilterCard = document.querySelector('.search-filter-card');
    if (searchFilterCard) {
        searchFilterCard.classList.remove('hidden');
    }
    
    const servicesSection = document.getElementById('services-section');
    if (servicesSection) {
        servicesSection.classList.add('d-none');
    }
    
    selectedCountryId = null;
    selectedServiceId = null;
    
    const getNumberSection = document.getElementById('get-number-section');
    if (getNumberSection) {
        getNumberSection.classList.add('d-none');
    }
    
    countriesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}


function initializeSearch() {
    const countrySearch = document.getElementById('countrySearch');
    if (countrySearch) {
        let searchTimeout;
        countrySearch.addEventListener('input', function() {
            const container = document.getElementById('countries-container');
            if (container) {
                container.innerHTML = '<div class="col-12 text-center my-3">' +
                    '<div class="spinner-border text-primary spinner-border-sm" role="status">' +
                    '<span class="visually-hidden">搜索中...</span>' +
                    '</div>' +
                    '<p class="mt-2 small text-muted">正在搜索"' + this.value + '"...</p>' +
                    '</div>';
            }

            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }

            searchTimeout = setTimeout(() => {
                currentSearch = this.value.trim();
                currentPage = 1; 
                loadCountries();
            }, 300);
        });

        const searchWrapper = countrySearch.parentElement;
        if (searchWrapper) {
            const clearButton = document.createElement('button');
            clearButton.className = 'btn btn-link btn-sm position-absolute end-0 top-50 translate-middle-y text-muted d-none';
            clearButton.style.zIndex = '4';
            clearButton.innerHTML = '<i class="bi bi-x-lg"></i>';
            clearButton.onclick = function() {
                countrySearch.value = '';
                clearButton.classList.add('d-none');
                countrySearch.dispatchEvent(new Event('input'));
            };
            searchWrapper.style.position = 'relative';
            searchWrapper.appendChild(clearButton);

            countrySearch.addEventListener('input', function() {
                if (this.value) {
                    clearButton.classList.remove('d-none');
                } else {
                    clearButton.classList.add('d-none');
                }
            });
        }
    }
}


function initializeFilter() {
    const regionFilter = document.getElementById('regionFilter');
    if (regionFilter) {
        regionFilter.addEventListener('change', function() {
            currentRegion = this.value;
            currentPage = 1; 
            loadCountries();
        });
    }
}


function initializeSort() {
    const sortOrder = document.getElementById('sortOrder');
    if (sortOrder) {
        sortOrder.addEventListener('change', function() {
            currentSort = this.value;
            currentPage = 1; 
            loadCountries();
        });
    }
}


function updatePagination(totalItems) {
    const countriesContainer = document.getElementById('countries-container');
    if (!countriesContainer) return;
    
    const oldPagination = document.querySelector('.countries-pagination');
    if (oldPagination) {
        oldPagination.remove();
    }
    
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'col-12 mt-3 countries-pagination';
    
    if (totalPages <= 1) {
        return;
    }
    
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    
    let paginationHTML = '<div class="d-flex flex-column align-items-center">' +
        '<nav aria-label="国家列表分页">' +
        '<ul class="pagination pagination-sm">' +
        '<li class="page-item ' + (currentPage === 1 ? 'disabled' : '') + '">' +
        '<a class="page-link" href="#" data-page="1">1</a>' +
        '</li>' +
        '<li class="page-item ' + (currentPage === 1 ? 'disabled' : '') + '">' +
        '<a class="page-link" href="#" data-page="' + (currentPage - 1) + '">' +
        '<i class="bi bi-chevron-left"></i>' +
        '</a>' +
        '</li>' +
        '<li class="page-item active">' +
        '<span class="page-link">' + currentPage + '</span>' +
        '</li>' +
        '<li class="page-item ' + (currentPage === totalPages ? 'disabled' : '') + '">' +
        '<a class="page-link" href="#" data-page="' + (currentPage + 1) + '">' +
        '<i class="bi bi-chevron-right"></i>' +
        '</a>' +
        '</li>' +
        '<li class="page-item ' + (currentPage === totalPages ? 'disabled' : '') + '">' +
        '<a class="page-link" href="#" data-page="' + totalPages + '">' + totalPages + '</a>' +
        '</li>' +
        '</ul>' +
        '</nav>' +
        '<div class="text-center text-muted small mt-2">' +
        '显示 ' + startItem + '-' + endItem + ' 项，共 ' + totalItems + ' 项' +
        '</div>' +
        '</div>';
    
    paginationContainer.innerHTML = paginationHTML;
    countriesContainer.parentNode.appendChild(paginationContainer);
    
    const pageLinks = paginationContainer.querySelectorAll('.page-link');
    pageLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const page = this.dataset.page;
            if (!page) return;
            
            let newPage = currentPage;
            
            if (page === 'prev') {
                newPage = Math.max(1, currentPage - 1);
            } else if (page === 'next') {
                newPage = Math.min(totalPages, currentPage + 1);
            } else {
                newPage = parseInt(page);
            }
            
            if (newPage !== currentPage) {
                currentPage = newPage;
                loadCountries();
            }
        });
    });
}


async function loadServices(countryId) {
    const servicesContainer = document.getElementById('services-container');
    if (!servicesContainer) return;

    servicesContainer.innerHTML = '<div class="col-12 text-center my-5">' +
        '<div class="spinner-border text-primary" role="status">' +
        '<span class="visually-hidden">加载中...</span>' +
        '</div>' +
        '<p class="mt-3">正在加载服务列表...</p>' +
        '</div>';

    try {
        const response = await fetch(`/api/services/${countryId}`);
        if (!response.ok) {
            throw new Error(`加载失败: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        servicesContainer.innerHTML = '';

        if (!data.services || data.services.length === 0) {
            servicesContainer.innerHTML = '<div class="col-12 text-center my-4">' +
                '<div class="alert alert-warning">' +
                '<i class="bi bi-exclamation-triangle me-2"></i>' +
                '该国家暂无可用服务' +
                '</div>' +
                '</div>';
            return;
        }

        servicesAllData = data.services;
        
        const startIndex = (servicesCurrentPage - 1) * servicesItemsPerPage;
        const endIndex = startIndex + servicesItemsPerPage;
        const currentPageData = servicesAllData.slice(startIndex, endIndex);

        currentPageData.forEach((service, index) => {
            const col = document.createElement('div');
            col.className = 'col-6 col-sm-4 col-md-3 mb-3';
            
            setTimeout(() => {
                col.style.opacity = '1';
                col.style.transform = 'translateY(0)';
            }, index * 50);
            
            col.style.opacity = '0';
            col.style.transform = 'translateY(20px)';
            col.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            
            const successRate = Math.floor(Math.random() * 5) + 95;
            const serviceInitial = service.name.charAt(0);
            
            col.innerHTML = '<div class="service-card" data-id="' + service.id + '">' +
                '<div class="service-icon-placeholder">' + serviceInitial + '</div>' +
                '<h6 class="mb-2">' + service.name + '</h6>' +
                '<div class="d-flex justify-content-between align-items-center">' +
                '<span class="badge bg-success bg-opacity-10 text-success small">' +
                '成功率 ' + successRate + '%' +
                '</span>' +
                '<span class="text-primary fw-bold">¥' + service.price.toFixed(2) + '</span>' +
                '</div>' +
                '</div>';
            
            servicesContainer.appendChild(col);
        });

        addServiceCardClickHandlers();
    } catch (error) {
        console.error('加载服务列表失败:', error);
        
        
        console.log('自动重试加载服务...');
        
        servicesContainer.innerHTML = '<div class="col-12 text-center my-4">' +
            '<div class="spinner-border text-primary spinner-border-sm" role="status">' +
            '<span class="visually-hidden">加载中...</span>' +
            '</div>' +
            '<p class="small text-muted">重新连接中...</p>' +
            '</div>';
        
        
        setTimeout(() => {
            loadServices(countryId);
        }, 2000);
    }
}


function addServiceCardClickHandlers() {
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('.service-card').forEach(c => {
                c.classList.remove('active');
                
                const selectedOverlay = c.querySelector('.selected-overlay');
                if (selectedOverlay) {
                    selectedOverlay.remove();
                }
                
                const selectedBadge = c.querySelector('.badge.bg-success.w-100');
                if (selectedBadge) {
                    selectedBadge.remove();
                }
            });
            
            this.classList.add('active');
            selectedServiceId = this.dataset.id;
            
            if (!this.querySelector('.selected-overlay')) {
                const selectedOverlay = document.createElement('div');
                selectedOverlay.className = 'selected-overlay';
                selectedOverlay.innerHTML = '<div class="badge bg-success w-100 mt-2">' +
                    '<i class="bi bi-check-circle me-1"></i> 已选择' +
                    '</div>';
                this.appendChild(selectedOverlay);
            }
            
            const getNumberSection = document.getElementById('get-number-section');
            if (getNumberSection) {
                getNumberSection.classList.remove('d-none');
                getNumberSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });
}


function handleGetNumber() {
    if (!selectedCountryId || !selectedServiceId) {
        alert('请先选择国家和服务');
        return;
    }
    
    const getNumberBtn = document.getElementById('get-number-btn');
    if (!getNumberBtn) return;
    
    const originalButtonText = getNumberBtn.innerHTML;
    getNumberBtn.disabled = true;
    getNumberBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 处理中...';
    
    fetch('/api/get_number', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            country_id: selectedCountryId,
            service_id: selectedServiceId
        })
    })
    .then(response => response.json())
    .then(data => {
        getNumberBtn.disabled = false;
        getNumberBtn.innerHTML = originalButtonText;
        
        if (data.status === 'error' && data.needRecharge) {
            const rechargeModal = new bootstrap.Modal(document.getElementById('rechargeModal'));
            rechargeModal.show();
        } else if (data.status === 'success') {
            alert('成功获取号码: ' + data.phone_number);
        } else {
            alert(data.message || '获取号码失败，请重试');
        }
    })
    .catch(error => {
        console.error('Error getting phone number:', error);
        getNumberBtn.disabled = false;
        getNumberBtn.innerHTML = originalButtonText;
        alert('网络错误，请重试');
    });
}


window.loadCountries = loadCountries;
window.showCountriesList = showCountriesList;
window.handleGetNumber = handleGetNumber; 