---
sticker: emoji//1f4dc
---
# 🗺️ Визуальная схема "Ресторана" (DDD)

Скопируй этот код в свой Obsidian, чтобы получить интерактивную карту:

```mermaid
graph TD
    %% Участники
    Guest((fa:fa-user Гость))
    Guard{💂‍♂️ Охранник<br/>middleware.py}
    Hostess[💁‍♀️ Хостес<br/>urls.py]
    Waiter[🤵‍♂️ Официант<br/>views.py]
    Chef[👨‍🍳 Шеф-повар<br/>services.py]
    
    subgraph Kitchen [КУХНЯ - Слой логики]
        Recipe[📖 Книга рецептов<br/>domain/models.py]
        Chef
    end

    subgraph Storage [СКЛАД - Слой данных]
        Keeper[👷‍♂️ Кладовщик<br/>repositories.py]
        Boxes[📦 Коробки с едой<br/>infrastructure/models.py]
        Cellar[(🗄️ Подвал / БД)]
    end

    Decorator[🎨 Оформитель<br/>templatetags/]

    %% Потоки (Путь запроса)
    Guest -->|1. Пришел к дверям| Guard
    Guard -->|2. Проверил фейсконтроль| Hostess
    Hostess -->|3. Проводил к столу| Waiter
    Waiter -->|4. Принял заказ| Chef
    
    %% Работа на кухне
    Chef -->|5. Смотрит рецепт| Recipe
    Chef -->|6. Заказывает продукты| Keeper
    
    %% Работа на складе
    Keeper -->|7. Ищет нужную коробку| Boxes
    Boxes <-->|8. Берет из подвала| Cellar
    Keeper -->|9. Моет и несет на кухню| Chef

    %% Возврат блюда
    Chef -->|10. Отдает готовое блюдо| Waiter
    Waiter -->|11. Зовет оформителя| Decorator
    Decorator -->|12. Украшает| Waiter
    Waiter -->|13. Выносит Гостю| Guest

    %% Стилизация
    style Kitchen fill:#f9f,stroke:#333,stroke-width:2px
    style Storage fill:#bbf,stroke:#333,stroke-width:2px
    style Guest fill:#fff,stroke:#333
```

### Как читать эту схему на защите:
1. **Запрос (Гость)** заходит в систему.
2. **Middleware (Охранник)** — первая линия обороны (время, лимиты).
3. **URLs (Хостес)** — решает, какой **View (Официант)** будет обслуживать.
4. **View** не думает, он просто зовет **Service (Шефа)**.
5. **Service** координирует: спрашивает правила у **Domain (Рецепт)** и просит данные у **Repository (Кладовщик)**.
6. **Repository** лезет в "грязный" **Подвал (БД)** и возвращает "чистые" продукты.
7. В конце **Template Tags (Оформитель)** наводит красоту перед тем, как гость увидит страницу.
