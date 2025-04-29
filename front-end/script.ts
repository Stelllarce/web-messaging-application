const allUsers: string[] = ["Dimi", "Andrei", "Denis", "Eli", "Valya"];
let currentChannel: string;
let creatingType: 'people' | 'group' = 'people';

function toggleSection(id: string, btn?: HTMLElement): void {
    const element = document.getElementById(id) as HTMLElement;
    const isVisible = element.style.display === 'block';

    element.style.display = isVisible ? 'none' : 'block';

    if (btn) {
        const arrow = btn.querySelector('.arrow');
        if (arrow) {
            arrow.textContent = isVisible ? '>' : 'v';
        }
    }
}

function loadChannel(name: string): void {
    currentChannel = name;
    const messagesDiv = document.getElementById('messages') as HTMLElement;
    messagesDiv.innerHTML = '';
    const currentChatName = document.getElementById('currentChatName') as HTMLElement;
    currentChatName.textContent = name;

    loadFixedMessages(name);
}

function sendMessage(): void {
    const input = document.getElementById('messageInput') as HTMLInputElement;
    const text = input.value.trim();
    if (text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = Math.random() > 0.5 ? 'message-left' : 'message-right';
        messageDiv.textContent = text;

        const messages = document.getElementById('messages') as HTMLElement;
        messages.appendChild(messageDiv);

        input.value = '';
        input.focus();
        messages.scrollTop = messages.scrollHeight;
    }
}

function showOptions(): void {
    const container = document.querySelector('.container') as HTMLElement;
    container.classList.toggle('options-open');
}

function showUserModal(type: 'people' | 'group'): void {
    creatingType = type;

    const userListDiv = document.getElementById('userList') as HTMLElement;
    const groupNameInput = document.getElementById('groupNameInput') as HTMLInputElement;

    userListDiv.innerHTML = '';
    groupNameInput.style.display = (type === 'group') ? 'block' : 'none';
    groupNameInput.value = '';

    allUsers.forEach(user => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = user;
        checkbox.id = user;

        const label = document.createElement('label');
        label.htmlFor = user;
        label.textContent = user;

        userListDiv.appendChild(checkbox);
        userListDiv.appendChild(label);
        userListDiv.appendChild(document.createElement('br'));
    });

    const modal = document.getElementById('userModal') as HTMLElement;
    modal.style.display = 'block';
}

function confirmUsers(): void {
    const selected: string[] = [];

    const checkboxes = document.querySelectorAll('#userList input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
    checkboxes.forEach(checkbox => {
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

        const listId = creatingType === 'group' ? 'groupList' : 'peopleList';
        const li = document.createElement('li');

        if (creatingType === 'group') {
            let groupName = (document.getElementById('groupNameInput') as HTMLInputElement).value.trim();
            if (!groupName) {
                groupName = selected.join(', ');
            }
            li.textContent = `# ${groupName}`;
            li.onclick = () => loadChannel(groupName);
        } else {
            const existing = Array.from(document.querySelectorAll('#peopleList li')).some(li => (li as HTMLElement).id === selected[0]);
            if (existing) {
                alert('You already have a private chat with this user!');
                return;
            }

            li.id = selected[0];
            li.textContent = `@ ${selected[0]}`;
            li.onclick = () => loadChannel(selected[0]);
        }

        const list = document.getElementById(listId) as HTMLElement;
        list.appendChild(li);
    }

    closeModal();
}

function closeModal(): void {
    const modal = document.getElementById('userModal') as HTMLElement;
    modal.style.display = 'none';
}

function loadFixedMessages(channel: string) {
    if (channel === 'General') {
        const messagesContainer = document.getElementById('messages');
        if (!messagesContainer) return;

        const fixedMessages = [
            { text: 'zdr', side: 'left' },
            { text: 'kp', side: 'right' },
            { text: 'web', side: 'left' }
        ];

        fixedMessages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = msg.side === 'left' ? 'message-left' : 'message-right';
            messageDiv.textContent = msg.text;
            messagesContainer.appendChild(messageDiv);
        });
    }
}
