function addNewUser(ok, username) {
	if (!ok) { return; }
	get(`/users?addNewUser&user=${username}`).then(d => {
		d = JSON.parse(d);
		const status = d.ok;
		if (d.ok) {
			document.getElementById("message").classList.add("green");
			document.getElementById("message").innerHTML = d.message;
			window.location.reload();
		} else {
			document.getElementById("message").classList.add("red");
			document.getElementById("message").innerHTML = d.message;
		}
		setTimeout(function(){
			document.getElementById("message").classList.remove((status ? "green" : "red"));
			document.getElementById("message").innerHTML = "";
		}, 2000);
	});
}
function deleteUser(username, messageElement) {
	get(`/users?deleteUser&user=${username}`).then(d => {
		d = JSON.parse(d);
		const status = d.ok;
		if (d.ok) {
			messageElement.classList.add("green");
			messageElement.innerHTML = d.message;
			window.location.reload();
		} else {
			messageElement.classList.add("red");
			messageElement.innerHTML = d.message;
		}
		setTimeout(function(){
			messageElement.classList.remove((status ? "green" : "red"));
			messageElement.innerHTML = "";
		}, 2000);
	})
}
function changePassword(username, newPassword, messageElement) {
	get(`/users?changePassword&user=${username}&pass=${newPassword}`).then(d => {
		d = JSON.parse(d);
		const status = d.ok;
		if (d.ok) {
			messageElement.classList.add("green");
			messageElement.innerHTML = d.message;
			// window.location.reload();
		} else {
			messageElement.classList.add("red");
			messageElement.innerHTML = d.message;
		}
		setTimeout(function(){
			messageElement.classList.remove((status ? "green" : "red"));
			messageElement.innerHTML = "";
		}, 2000);
	});
}

document.querySelectorAll(".user > input").forEach(i_ => {
	const i = i_;
	i.addEventListener("blur", e => {
		changePassword(
			e.target.parentElement.children[0].innerHTML,
			e.target.value,
			e.target.parentElement.children[3]);
	});
	i.addEventListener("keyup", e => {
		if (e.key === "Enter" || e.keyCode === 13) {
			changePassword(
				e.target.parentElement.children[0].innerHTML,
				e.target.value,
				e.target.parentElement.children[3]);
		}
	})
});
