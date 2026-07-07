package com.films.shared.ui

object Strings {
    private val english = mapOf(
        "app_name" to "Films",
        "tab_search" to "Search",
        "tab_lists" to "Lists",
        "tab_premieres" to "Premieres",
        "tab_recommendations" to "Recommendations",
        "search_title" to "Search Movies",
        "search_placeholder" to "Search movies...",
        "search_trending" to "Trending Now",
        "search_results" to "Results",
        "lists_title" to "My Lists",
        "lists_empty" to "List is empty",
        "lists_tab_watchlist" to "Want to Watch",
        "lists_tab_watched" to "Watched",
        "lists_tab_favorites" to "Favorites",
        "lists_remove" to "Remove",
        "lists_avg_rating" to "★ Average: %s",
        "lists_rating" to "Rating: %s/10",
        "calendar_title" to "Upcoming Premieres",
        "calendar_date_unknown" to "Date TBD",
        "recs_title" to "Recommended For You",
        "recs_subtitle" to "Based on your watch history",
        "detail_back" to "← Back to Search",
        "detail_overview" to "Overview",
        "detail_minutes" to "min",
        "detail_btn_watchlist" to "Want to Watch",
        "detail_btn_watchlist_active" to "✓ Want to Watch",
        "detail_btn_watched" to "Watched",
        "detail_btn_watched_active" to "✓ Watched",
        "detail_btn_favorites" to "Add to Favorites",
        "detail_btn_favorites_active" to "✓ In Favorites",
        "detail_cast" to "Cast",
        "detail_similar" to "Similar Movies",
        "detail_loading" to "Loading..."
    )

    private val russian = mapOf(
        "app_name" to "Films",
        "tab_search" to "Поиск",
        "tab_lists" to "Списки",
        "tab_premieres" to "Премьеры",
        "tab_recommendations" to "Рекомендации",
        "search_title" to "Поиск фильмов",
        "search_placeholder" to "Поиск фильмов...",
        "search_trending" to "Сейчас в тренде",
        "search_results" to "Результаты",
        "lists_title" to "Мои списки",
        "lists_empty" to "Список пуст",
        "lists_tab_watchlist" to "Хочу посмотреть",
        "lists_tab_watched" to "Просмотрено",
        "lists_tab_favorites" to "Избранное",
        "lists_remove" to "Удалить",
        "lists_avg_rating" to "★ Средний: %s",
        "lists_rating" to "Оценка: %s/10",
        "calendar_title" to "Ближайшие премьеры",
        "calendar_date_unknown" to "Дата неизвестна",
        "recs_title" to "Рекомендации для тебя",
        "recs_subtitle" to "На основе твоих просмотренных фильмов",
        "detail_back" to "← Назад к поиску",
        "detail_overview" to "Описание",
        "detail_minutes" to "мин",
        "detail_btn_watchlist" to "Хочу посмотреть",
        "detail_btn_watchlist_active" to "✓ Хочу посмотреть",
        "detail_btn_watched" to "Просмотрено",
        "detail_btn_watched_active" to "✓ Просмотрено",
        "detail_btn_favorites" to "В избранное",
        "detail_btn_favorites_active" to "✓ В избранное",
        "detail_cast" to "Актёры",
        "detail_similar" to "Похожие фильмы",
        "detail_loading" to "Загрузка..."
    )

    private val locales = mapOf(
        "en" to english,
        "ru" to russian
    )

    var currentLocale: String = "en"
        private set

    fun setLocale(locale: String) {
        currentLocale = if (locales.containsKey(locale)) locale else "en"
    }

    fun get(key: String): String {
        val localeMap = locales[currentLocale] ?: english
        return localeMap[key] ?: english[key] ?: key
    }

    fun get(key: String, vararg args: Any): String {
        var template = get(key)
        for (arg in args) {
            template = template.replaceFirst("%s", arg.toString())
        }
        return template
    }
}
