package com.films.desktop

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application
import androidx.compose.ui.window.rememberWindowState
import com.films.shared.api.FilmsApi
import com.films.shared.ui.*
import java.util.Locale

fun main() = application {
    val locale = Locale.getDefault().language
    if (locale == "ru") {
        Strings.setLocale("ru")
    }

    val api = remember { FilmsApi() }
    var currentScreen by remember { mutableStateOf("search") }
    var selectedMovieId by remember { mutableIntStateOf(0) }

    Window(
        onCloseRequest = ::exitApplication,
        title = "Films",
        state = rememberWindowState(width = 1280.dp, height = 800.dp)
    ) {
        MaterialTheme(colorScheme = darkColorScheme()) {
            Surface(modifier = Modifier.fillMaxSize().background(DarkBg)) {
                Row(modifier = Modifier.fillMaxSize()) {
                    Surface(
                        modifier = Modifier.width(200.dp).fillMaxHeight(),
                        color = DarkSurface
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("Films", color = Accent, style = MaterialTheme.typography.headlineMedium)
                            Spacer(modifier = Modifier.height(24.dp))
                            listOf(
                                "search" to Strings.get("tab_search"),
                                "lists" to Strings.get("tab_lists"),
                                "calendar" to Strings.get("tab_premieres"),
                                "recs" to Strings.get("tab_recommendations")
                            ).forEach { (key, label) ->
                                Surface(
                                    modifier = Modifier.fillMaxWidth().padding(vertical = 2.dp),
                                    color = if (currentScreen == key) Accent else DarkSurface,
                                    onClick = { currentScreen = key },
                                    shape = MaterialTheme.shapes.small
                                ) {
                                    Text(
                                        text = label,
                                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                                        color = if (currentScreen == key) MaterialTheme.colorScheme.onPrimary else Muted
                                    )
                                }
                            }
                        }
                    }

                    Box(modifier = Modifier.weight(1f).background(DarkBg)) {
                        when (currentScreen) {
                            "search" -> SearchScreen(api) { id -> selectedMovieId = id; currentScreen = "detail" }
                            "lists" -> ListsScreen(api) { id -> selectedMovieId = id; currentScreen = "detail" }
                            "calendar" -> CalendarScreen(api)
                            "recs" -> RecommendationsScreen(api) { id -> selectedMovieId = id; currentScreen = "detail" }
                            "detail" -> MovieDetailScreen(api, selectedMovieId, { currentScreen = "search" }) { id -> selectedMovieId = id }
                        }
                    }
                }
            }
        }
    }
}
