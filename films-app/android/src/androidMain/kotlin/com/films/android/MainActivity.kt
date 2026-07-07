package com.films.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import com.films.shared.api.FilmsApi
import com.films.shared.ui.*

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val locale = java.util.Locale.getDefault().language
        if (locale == "ru") {
            Strings.setLocale("ru")
        }

        setContent {
            val api = remember { FilmsApi("http://10.0.2.2:3001/api") }
            var selectedMovieId by remember { mutableIntStateOf(0) }
            var showDetail by remember { mutableStateOf(false) }
            var currentTab by remember { mutableIntStateOf(0) }

            val tabs = listOf(
                TabItem(Strings.get("tab_search"), Icons.Default.Search),
                TabItem(Strings.get("tab_lists"), Icons.Default.Favorite),
                TabItem(Strings.get("tab_premieres"), Icons.Default.CalendarMonth),
                TabItem(Strings.get("tab_recommendations"), Icons.Default.Star)
            )

            MaterialTheme(colorScheme = darkColorScheme()) {
                Surface(modifier = Modifier.fillMaxSize().background(DarkBg)) {
                    if (showDetail) {
                        MovieDetailScreen(
                            api = api,
                            movieId = selectedMovieId,
                            onBack = { showDetail = false },
                            onMovieClick = { id ->
                                selectedMovieId = id
                            }
                        )
                    } else {
                        Scaffold(
                            bottomBar = {
                                NavigationBar(
                                    containerColor = Color(0xFF0f3460)
                                ) {
                                    tabs.forEachIndexed { index, tab ->
                                        NavigationBarItem(
                                            icon = { Icon(tab.icon, contentDescription = tab.title) },
                                            label = { Text(tab.title) },
                                            selected = currentTab == index,
                                            onClick = { currentTab = index },
                                            colors = NavigationBarItemDefaults.colors(
                                                selectedIconColor = Accent,
                                                selectedTextColor = Accent,
                                                unselectedIconColor = Muted,
                                                unselectedTextColor = Muted,
                                                indicatorColor = Color.Transparent
                                            )
                                        )
                                    }
                                }
                            },
                            containerColor = DarkBg
                        ) { padding ->
                            when (currentTab) {
                                0 -> SearchScreen(
                                    api = api,
                                    onMovieClick = { id ->
                                        selectedMovieId = id
                                        showDetail = true
                                    },
                                    modifier = Modifier.padding(padding)
                                )
                                1 -> ListsScreen(
                                    api = api,
                                    onMovieClick = { id ->
                                        selectedMovieId = id
                                        showDetail = true
                                    },
                                    modifier = Modifier.padding(padding)
                                )
                                2 -> CalendarScreen(
                                    api = api,
                                    modifier = Modifier.padding(padding)
                                )
                                3 -> RecommendationsScreen(
                                    api = api,
                                    onMovieClick = { id ->
                                        selectedMovieId = id
                                        showDetail = true
                                    },
                                    modifier = Modifier.padding(padding)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

data class TabItem(val title: String, val icon: ImageVector)
