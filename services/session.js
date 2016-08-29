altriaMap.service('Session', function () {

	this.create = function (data) {
		sessionStorage.setItem('username', data.username);
		sessionStorage.setItem('userId', data.id);
		sessionStorage.setItem('brands', data.brands);
    sessionStorage.setItem('delete_notes', data.delete_notes);
	};

	this.clear = function () {
		sessionStorage.clear();
	};

	this.getSession = function () {
		var data = {};
		data.username = sessionStorage.getItem('username');
		data.userId = sessionStorage.getItem('userId');
		data.brands = sessionStorage.getItem('brands');
    data.delete_notes = sessionStorage.getItem('delete_notes');
		return data;
	};

	return this;
});
