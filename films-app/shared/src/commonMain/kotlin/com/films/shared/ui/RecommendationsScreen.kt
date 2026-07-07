package com.films.shared.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.films.shared.api.FilmsApi
import com.films.shared.model.Movie

@Composable
fun RecommendationsScreen(api: FilmsApi, onMovieClick: (Int) -> Unit, modifier: Modifier = Modifier) {
    var recs by remember { mutableStateOf(emptyList<Movie>()) }
    var loading by remember { mutableStateOf(true) }

    LaunchedEffect(Unit) {
        recs = api.recommendations()
        loading = false
    }

    Column(modifier = modifier.fillMaxSize().padding(16.dp)) {
        Text(Strings.get("recs_title"), fontSize = 28.sp, fontWeight = FontWeight.Bold, color = TextWhite)
        Spacer(modifier = Modifier.height(4.dp))
        Text(Strings.get("recs_subtitle"), color = Muted, fontSize = 13.sp)
        Spacer(modifier = Modifier.height(16.dp))

        if (loading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Accent)
            }
        } else {
            LazyVerticalGrid(
                columns = GridCells.Adaptive(160.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(recs) { movie ->
                    Card(
                        modifier = Modifier.clickable { onMovieClick(movie.id) },
                        colors = CardDefaults.cardColors(containerColor = DarkSurface),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Column {
                            AsyncImage(
                                url = movie.poster_path,
                                contentDescription = movie.title,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(240.dp)
                                    .clip(RoundedCornerShape(topStart = 12.dp, topEnd = 12.dp))
                            )
                            Column(modifier = Modifier.padding(8.dp)) {
                                Text(movie.title, color = TextWhite, fontSize = 13.sp, fontWeight = FontWeight.Medium, maxLines = 2)
                                Text("★ ${"%.1f".format(movie.vote_average)}", color = Gold, fontSize = 12.sp)
                            }
                        }
                    }
                }
            }
        }
    }
}
