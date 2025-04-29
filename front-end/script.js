var allUsers = ["Dimi", "Andrei", "Denis", "Eli", "Valya"];
var currentChannel;
var creatingType = 'people';
function toggleSection(id, btn) {
    var element = document.getElementById(id);
    var isVisible = element.style.display === 'block';
    element.style.display = isVisible ? 'none' : 'block';
    if (btn) {
        var arrow = btn.querySelector('.arrow');
        if (arrow) {
            arrow.textContent = isVisible ? '>' : 'v';
        }
    }
}
function loadChannel(name) {
    currentChannel = name;
    var messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = '';
    var currentChatName = document.getElementById('currentChatName');
    currentChatName.textContent = name;
    loadFixedMessages(name);
}
function sendMessage() {
    var input = document.getElementById('messageInput');
    var text = input.value.trim();
    if (text) {
        var messageDiv = document.createElement('div');
        messageDiv.className = Math.random() > 0.5 ? 'message-left' : 'message-right';
        messageDiv.textContent = text;
        var messages = document.getElementById('messages');
        messages.appendChild(messageDiv);
        input.value = '';
        input.focus();
        messages.scrollTop = messages.scrollHeight;
    }
}
function showOptions() {
    var container = document.querySelector('.container');
    container.classList.toggle('options-open');
}
function showUserModal(type) {
    creatingType = type;
    var userListDiv = document.getElementById('userList');
    var groupNameInput = document.getElementById('groupNameInput');
    userListDiv.innerHTML = '';
    groupNameInput.style.display = (type === 'group') ? 'block' : 'none';
    groupNameInput.value = '';
    allUsers.forEach(function (user) {
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = user;
        checkbox.id = user;
        var label = document.createElement('label');
        label.htmlFor = user;
        label.textContent = user;
        userListDiv.appendChild(checkbox);
        userListDiv.appendChild(label);
        userListDiv.appendChild(document.createElement('br'));
    });
    var modal = document.getElementById('userModal');
    modal.style.display = 'block';
}
function confirmUsers() {
    var selected = [];
    var checkboxes = document.querySelectorAll('#userList input[type="checkbox"]');
    checkboxes.forEach(function (checkbox) {
        if (checkbox.checked) {
            selected.push(checkbox.value);
        }
    });
    if (selected.length > 0) {
        if (creatingType === 'people' && selected.length > 1) {
            alert('You can only select one user for private chat!');
            return;
        }
        if (creatingType === 'group' && selected.length < 2) {
            alert('You need to select at least two users for a group chat!');
            return;
        }
        var listId = creatingType === 'group' ? 'groupList' : 'peopleList';
        var li = document.createElement('li');
        if (creatingType === 'group') {
            var groupName_1 = document.getElementById('groupNameInput').value.trim();
            if (!groupName_1) {
                groupName_1 = selected.join(', ');
            }
            li.textContent = "# ".concat(groupName_1);
            li.onclick = function () { return loadChannel(groupName_1); };
        }
        else {
            var existing = Array.from(document.querySelectorAll('#peopleList li')).some(function (li) { return li.id === selected[0]; });
            if (existing) {
                alert('You already have a private chat with this user!');
                return;
            }
            li.id = selected[0];
            li.textContent = "@ ".concat(selected[0]);
            li.onclick = function () { return loadChannel(selected[0]); };
        }
        var list = document.getElementById(listId);
        list.appendChild(li);
    }
    closeModal();
}
function closeModal() {
    var modal = document.getElementById('userModal');
    modal.style.display = 'none';
}
function loadFixedMessages(channel) {
    if (channel === 'General') {
        var messagesContainer_1 = document.getElementById('messages');
        if (!messagesContainer_1)
            return;
        var fixedMessages = [
            { text: 'zdr', side: 'left' },
            { text: 'kp', side: 'right' },
            { text: 'web', side: 'left' }
        ];
        fixedMessages.forEach(function (msg) {
            var messageDiv = document.createElement('div');
            messageDiv.className = msg.side === 'left' ? 'message-left' : 'message-right';
            messageDiv.textContent = msg.text;
            messagesContainer_1.appendChild(messageDiv);
        });
    }
}
