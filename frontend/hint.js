// Кнопка «Подсказка» и окно с ответом ai-service. Подключается на уровнях, где дрон ходит по полю.
class HintPanel {
    static init() {
        const buttons = document.querySelector('.control-buttons');
        if (!buttons || document.getElementById('hintButton')) return;

        const button = document.createElement('button');
        button.id = 'hintButton';
        button.type = 'button';
        button.className = 'control-button';
        button.textContent = 'Подсказка';
        button.style.cssText = 'background: transparent; border: 1px solid #ffd166; color: #ffd166;';
        button.addEventListener('click', () => HintPanel.ask());
        buttons.appendChild(button);

        const panel = document.createElement('div');
        panel.id = 'hintPanel';
        panel.style.cssText = 'display: none; position: fixed; right: 20px; top: 20px; width: 320px; ' +
            'max-height: 60vh; overflow-y: auto; padding: 16px; background: #151530; color: #ffffff; ' +
            'border: 2px solid #ffd166; box-shadow: 0 0 15px rgba(255, 209, 102, 0.4); ' +
            'font-family: "Courier New", monospace; font-size: 14px; z-index: 1000;';
        panel.innerHTML = '<div style="display: flex; justify-content: space-between; margin-bottom: 10px;">' +
            '<b style="color: #ffd166;">Подсказка</b>' +
            '<span id="hintClose" style="cursor: pointer;">✕</span></div>' +
            '<div id="hintText"></div><ol id="hintSteps" style="margin: 10px 0 0 20px;"></ol>';
        document.body.appendChild(panel);
        document.getElementById('hintClose').addEventListener('click', () => HintPanel.hide());
    }

    // Программа игрока в том виде, как её ждёт ai-service
    static serialize(level) {
        const blocks = level.topLevelBlocks ? level.topLevelBlocks() : level.programBlocks;
        return blocks.map((block) => {
            if (block.action !== 'loop') return block.action;
            const body = block.element.querySelector('.loop-body');
            return {
                type: 'loop',
                count: block.count || 3,
                body: level.getBlocksInLoopBody(body).map((inner) => inner.action)
            };
        });
    }

    static async ask() {
        if (!level || level.isExecuting) return;
        HintPanel.show('Думаю...', []);

        try {
            const answer = await HintService.get(level.config.id, HintPanel.serialize(level));
            HintPanel.show(answer.hint || 'Для этого уровня подсказок пока нет.', answer.nextSteps || []);
        } catch (error) {
            HintPanel.show('Не получилось получить подсказку, попробуй ещё раз чуть позже.', []);
        }
    }

    static show(text, steps) {
        document.getElementById('hintText').textContent = text;
        const list = document.getElementById('hintSteps');
        list.innerHTML = '';
        steps.forEach((step) => {
            const item = document.createElement('li');
            item.textContent = step;
            list.appendChild(item);
        });
        document.getElementById('hintPanel').style.display = 'block';
    }

    static hide() {
        document.getElementById('hintPanel').style.display = 'none';
    }
}

window.addEventListener('DOMContentLoaded', () => HintPanel.init());
