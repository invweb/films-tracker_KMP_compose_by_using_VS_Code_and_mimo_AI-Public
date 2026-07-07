package com.films.shared.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.films.shared.api.FilmsApi
import com.films.shared.model.Movie
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchScreen(api: FilmsApi, onMovieClick: (Int) -> Unit, modifier: Modifier = Modifier) {
    var query by remember { mutableStateOf("") }
    var results by remember { mutableStateOf(emptyList<Movie>()) }
    var trending by remember { mutableStateOf(emptyList<Movie>()) }
    var loading by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    fun refresh() {
        scope.launch {
            loading = true
            if (query.length >= 2) {
                results = api.search(query)
            } else {
                trending = api.trending()
            }
            loading = false
        }
    }

    LaunchedEffect(Unit) { refresh() }

    LaunchedEffect(query) {
        if (query.length >= 2) {
            loading = true
            results = api.search(query)
            loading = false
        } else {
            results = emptyList()
        }
    }

    val movies = if (query.length >= 2) results else trending
    val label = if (query.length >= 2) Strings.get("search_results") else Strings.get("search_trending")

    Column(modifier = modifier.fillMaxSize().padding(16.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(Strings.get("search_title"), fontSize = 28.sp, fontWeight = FontWeight.Bold, color = TextWhite, modifier = Modifier.weight(1f))
            IconButton(onClick = { refresh() }) {
                Icon(Icons.Default.Refresh, contentDescription = "Refresh", tint = Muted)
            }
        }
        Spacer(modifier = Modifier.height(16.dp))
        SearchBar(query = query, onQueryChange = { query = it }, placeholder = Strings.get("search_placeholder"))
        Spacer(modifier = Modifier.height(12.dp))
        Text(
            text = "$label ${if (loading) "..." else ""}",
            color = Muted, fontSize = 13.sp,
            modifier = Modifier.padding(bottom = 12.dp)
        )
        MovieGrid(movies = movies) { onMovieClick(it.id) }
    }
}
