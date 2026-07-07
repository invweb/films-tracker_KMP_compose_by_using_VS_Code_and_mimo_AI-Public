package com.films.shared.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.films.shared.api.FilmsApi
import com.films.shared.model.Stats
import com.films.shared.model.UserMovie
import kotlinx.coroutines.launch

enum class ListTab(val key: String) {
    WATCHLIST("lists_tab_watchlist"),
    WATCHED("lists_tab_watched"),
    FAVORITES("lists_tab_favorites")
}

@Composable
fun ListsScreen(api: FilmsApi, onMovieClick: (Int) -> Unit, modifier: Modifier = Modifier) {
    var activeTab by remember { mutableStateOf(ListTab.WATCHLIST) }
    var watchlist by remember { mutableStateOf(emptyList<UserMovie>()) }
    var watched by remember { mutableStateOf(emptyList<UserMovie>()) }
    var favorites by remember { mutableStateOf(emptyList<UserMovie>()) }
    var stats by remember { mutableStateOf<Stats?>(null) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        watchlist = api.getWatchlist()
        watched = api.getWatched()
        favorites = api.getFavorites()
        stats = api.getStats()
    }

    val currentList = when (activeTab) {
        ListTab.WATCHLIST -> watchlist
        ListTab.WATCHED -> watched
        ListTab.FAVORITES -> favorites
    }
    val counts = mapOf(
        ListTab.WATCHLIST to watchlist.size,
        ListTab.WATCHED to watched.size,
        ListTab.FAVORITES to favorites.size
    )

    Column(modifier = modifier.fillMaxSize().padding(16.dp)) {
        Text(Strings.get("lists_title"), fontSize = 28.sp, fontWeight = FontWeight.Bold, color = TextWhite)
        Spacer(modifier = Modifier.height(8.dp))

        stats?.let { s ->
            Text(
                text = Strings.get("lists_avg_rating", s.avgRating?.let { "%.1f".format(it) } ?: "—"),
                color = Gold,
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.height(12.dp))
        }

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            ListTab.entries.forEach { tab ->
                FilterChip(
                    selected = activeTab == tab,
                    onClick = { activeTab = tab },
                    label = { Text("${Strings.get(tab.key)} (${counts[tab]})", fontSize = 12.sp) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = Accent,
                        selectedLabelColor = Color.White
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(currentList) { movie ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = DarkSurface),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        AsyncImage(
                            url = movie.poster_path,
                            contentDescription = movie.title,
                            modifier = Modifier
                                .width(80.dp)
                                .height(120.dp)
                                .clip(RoundedCornerShape(8.dp))
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = movie.title ?: "Film #${movie.tmdb_id}",
                                color = TextWhite,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.SemiBold,
                                modifier = Modifier.clickable { onMovieClick(movie.tmdb_id) }
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = buildString {
                                    append(movie.release_date?.take(4) ?: "")
                                    movie.rating?.let { append(" · ${Strings.get("lists_rating", it.toString())}") }
                                    movie.vote_average?.let { append(" · ★ ${"%.1f".format(it)}") }
                                },
                                color = Muted,
                                fontSize = 13.sp
                            )
                        }
                        TextButton(onClick = {
                            scope.launch {
                                api.removeFromList(movie.tmdb_id, activeTab.name.lowercase())
                                watchlist = api.getWatchlist()
                                watched = api.getWatched()
                                favorites = api.getFavorites()
                            }
                        }) {
                            Text(Strings.get("lists_remove"), color = Accent, fontSize = 12.sp)
                        }
                    }
                }
            }
        }

        if (currentList.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(Strings.get("lists_empty"), color = Muted, fontSize = 16.sp)
            }
        }
    }
}
