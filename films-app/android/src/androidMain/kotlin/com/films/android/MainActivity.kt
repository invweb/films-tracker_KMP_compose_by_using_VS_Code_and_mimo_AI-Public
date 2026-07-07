package com.films.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.films.shared.api.FilmsApi
import com.films.shared.ui.*

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val api = remember { FilmsApi("http://10.0.2.2:3001/api") }
            var currentScreen by remember { mutableStateOf("search") }
            var selectedMovieId by remember { mutableIntStateOf(0) }

            MaterialTheme(colorScheme = darkColorScheme()) {
                Surface(modifier = Modifier.fillMaxSize().background(DarkBg)) {
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
