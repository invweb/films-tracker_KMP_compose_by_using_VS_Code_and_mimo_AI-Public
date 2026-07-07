package com.films.shared.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
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
import com.films.shared.model.Movie
import kotlinx.coroutines.launch

@Composable
fun MovieDetailScreen(api: FilmsApi, movieId: Int, onBack: () -> Unit, onMovieClick: (Int) -> Unit) {
    val scope = rememberCoroutineScope()
    var movie by remember { mutableStateOf<Movie?>(null) }
    var inWatchlist by remember { mutableStateOf(false) }
    var inWatched by remember { mutableStateOf(false) }
    var inFavorites by remember { mutableStateOf(false) }

    LaunchedEffect(movieId) {
        movie = api.movieDetail(movieId)
        val watchlist = api.getWatchlist()
        val watched = api.getWatched()
        val favorites = api.getFavorites()
        inWatchlist = watchlist.any { it.tmdb_id == movieId }
        inWatched = watched.any { it.tmdb_id == movieId }
        inFavorites = favorites.any { it.tmdb_id == movieId }
    }

    val m = movie ?: return

    LazyColumn(modifier = Modifier.fillMaxSize()) {
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(250.dp)
                    .background(DarkSurface)
            ) {
                AsyncImage(
                    url = m.backdrop_path,
                    contentDescription = m.title,
                    modifier = Modifier.fillMaxSize()
                )
                IconButton(
                    onClick = onBack,
                    modifier = Modifier
                        .padding(16.dp)
                        .align(Alignment.TopStart)
                        .background(Color.Black.copy(alpha = 0.5f), CircleShape)
                ) {
                    Text("←", color = Color.White, fontSize = 20.sp)
                }
            }
        }

        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
                    .offset(y = (-60).dp)
            ) {
                Row(modifier = Modifier.fillMaxWidth()) {
                    AsyncImage(
                        url = m.poster_path,
                        contentDescription = m.title,
                        modifier = Modifier
                            .width(120.dp)
                            .height(180.dp)
                            .clip(RoundedCornerShape(12.dp))
                    )
                    Spacer(modifier = Modifier.width(16.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(m.title, color = TextWhite, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            "${m.release_date.take(4)}${m.runtime?.let { " · $it ${Strings.get("detail_minutes")}" } ?: ""}",
                            color = Muted, fontSize = 14.sp
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("★ ${"%.1f".format(m.vote_average)}", color = Gold, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(12.dp))

                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            m.genres.forEach { genre ->
                                SuggestionChip(
                                    onClick = {},
                                    label = { Text(genre.name, fontSize = 11.sp) },
                                    colors = SuggestionChipDefaults.suggestionChipColors(
                                        containerColor = DarkSurface
                                    )
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(
                        onClick = {
                            scope.launch {
                                if (inWatchlist) {
                                    api.removeFromList(movieId, "watchlist")
                                    inWatchlist = false
                                } else {
                                    api.addToWatchlist(movieId)
                                    inWatchlist = true
                                }
                            }
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (inWatchlist) Accent else Color.Transparent
                        ),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text(
                            if (inWatchlist) Strings.get("detail_btn_watchlist_active") else Strings.get("detail_btn_watchlist"),
                            fontSize = 12.sp
                        )
                    }
                    Button(
                        onClick = {
                            scope.launch {
                                if (inWatched) {
                                    api.removeFromList(movieId, "watched")
                                    inWatched = false
                                } else {
                                    api.markWatched(movieId)
                                    inWatched = true
                                }
                            }
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (inWatched) Accent else Color.Transparent
                        ),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text(
                            if (inWatched) Strings.get("detail_btn_watched_active") else Strings.get("detail_btn_watched"),
                            fontSize = 12.sp
                        )
                    }
                    Button(
                        onClick = {
                            scope.launch {
                                if (inFavorites) {
                                    api.removeFromList(movieId, "favorites")
                                    inFavorites = false
                                } else {
                                    api.addToFavorites(movieId)
                                    inFavorites = true
                                }
                            }
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (inFavorites) Accent else Color.Transparent
                        ),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text(
                            if (inFavorites) Strings.get("detail_btn_favorites_active") else Strings.get("detail_btn_favorites"),
                            fontSize = 12.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))
                Text(Strings.get("detail_overview"), color = TextWhite, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(8.dp))
                Text(m.overview, color = TextWhite, fontSize = 15.sp, lineHeight = 22.sp)
            }
        }
    }
}
