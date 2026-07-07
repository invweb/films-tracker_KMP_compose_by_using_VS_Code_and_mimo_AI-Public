package com.films.web

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.window.CanvasBasedWindow
import com.films.shared.api.FilmsApi
import com.films.shared.ui.*

@OptIn(ExperimentalComposeUiApi::class)
fun main() {
    CanvasBasedWindow(title = "Films") {
        val api = remember { FilmsApi() }
        var currentScreen by remember { mutableStateOf("search") }
        var selectedMovieId by remember { mutableIntStateOf(0) }

        MaterialTheme(colorScheme = darkColorScheme()) {
            Surface(modifier = Modifier.fillMaxSize().background(DarkBg)) {
                when (currentScreen) {
                    "search" -> SearchScreen(
                        api = api,
                        onMovieClick = { id -> selectedMovieId = id; currentScreen = "detail" }
                    )
                    "lists" -> ListsScreen(
                        api = api,
                        onMovieClick = { id -> selectedMovieId = id; currentScreen = "detail" }
                    )
                    "calendar" -> CalendarScreen(api = api)
                    "recs" -> RecommendationsScreen(
                        api = api,
                        onMovieClick = { id -> selectedMovieId = id; currentScreen = "detail" }
                    )
                    "detail" -> MovieDetailScreen(
                        api = api,
                        movieId = selectedMovieId,
                        onBack = { currentScreen = "search" },
                        onMovieClick = { id -> selectedMovieId = id }
                    )
                }
            }
        }
    }
}
