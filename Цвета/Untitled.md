<div style="
    /* ВВЕДИ ДВА ЦВЕТА СЮДА, ОНИ САМИ ВСЁ ПЕРЕКРАСЯТ */
    --bg-color: #F4C2C2; 
    --text-color: #800020;

    /* Стили карточки */
    background-color: var(--bg-color);
    color: var(--text-color);
    padding: 24px;
    border-radius: 20px;
    font-family: 'IBM Plex Sans', sans-serif;
    width: 280px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    margin: 15px 0;
    text-align: center;
">
    <!-- Заголовок -->
    <h3 style="margin: 0; font-size: 22px; font-weight: bold; color: var(--text-color); letter-spacing: 0.5px;">
        ЗАГОЛОВОК ИНТЕРФЕЙСА
    </h3>

    <!-- Интерактивная плашка ТЕКСТА (Копирование по клику) -->
    <div onclick="navigator.clipboard.writeText('#800020'); alert('Скопировано: #800020')" 
         style="font-size: 16px; font-weight: 500; cursor: pointer; user-select: none;">
        #800020
    </div>

    <!-- Интерактивная плашка ФОНА (Кнопка, цвета вывернуты, копирование по клику) -->
    <div onclick="navigator.clipboard.writeText('#F4C2C2'); alert('Скопировано: #F4C2C2')" 
         style="
            background-color: var(--text-color);
            color: var(--bg-color);
            padding: 6px 16px;
            border-radius: 12px;
            font-weight: bold;
            font-size: 16px;
            cursor: pointer;
            width: 80%;
            user-select: none;
         ">
        #F4C2C2
    </div>
</div>

