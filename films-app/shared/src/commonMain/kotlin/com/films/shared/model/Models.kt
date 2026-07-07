package com.films.shared.model

import kotlinx.serialization.Serializable

@Serializable
data class Movie(
    val id: Int,
    val tmdb_id: Int = id,
    val title: String,
    val poster_path: String? = null,
    val backdrop_path: String? = null,
    val overview: String = "",
    val release_date: String = "",
    val vote_average: Double = 0.0,
    val genre_ids: List<Int> = emptyList(),
    val genres: List<Genre> = emptyList(),
    val runtime: Int? = null,
    val director: String? = null,
    val actors: String? = null,
    val rated: String? = null,
)

@Serializable
data class Genre(
    val id: Int = 0,
    val name: String = "",
)

@Serializable
data class UserMovie(
    val id: Int? = null,
    val tmdb_id: Int,
    val list_type: String,
    val rating: Int? = null,
    val notes: String? = null,
    val tags: String? = null,
    val title: String? = null,
    val poster_path: String? = null,
    val release_date: String? = null,
    val vote_average: Double? = null,
    val created_at: String? = null,
)

@Serializable
data class MovieResponse(
    val results: List<Movie> = emptyList(),
)

@Serializable
data class Stats(
    val watchlist: Int = 0,
    val watched: Int = 0,
    val favorites: Int = 0,
    val avgRating: Double? = null,
)

val GENRE_MAP = mapOf(
    28 to "Боевик",
    12 to "Приключения",
    16 to "Мультфильм",
    35 to "Комедия",
    80 to "Криминал",
    99 to "Документальный",
    18 to "Драма",
    10751 to "Семейный",
    14 to "Фэнтези",
    36 to "История",
    27 to "Ужасы",
    10402 to "Музыка",
    9648 to "Детектив",
    10749 to "Мелодрама",
    878 to "Фантастика",
    10770 to "Телевизионный фильм",
    53 to "Триллер",
    10752 to "Военный",
    37 to "Вестерн"
)
