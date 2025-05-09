import { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import type { Paper as PaperType } from '../services/api';
import { paperService } from '../services/api';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PaperType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('請輸入搜索關鍵詞');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await paperService.searchPapers(query);
      setResults(data);
    } catch (err) {
      setError('搜索失敗，請稍後重試');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box sx={{ flexGrow: 1, width: '100%', p: 3 }}>
      <Container maxWidth="md">
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom align="center">
            搜索論文
          </Typography>

          <Box sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="搜索關鍵詞"
                variant="outlined"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                error={!!error}
                helperText={error}
                size="medium"
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                sx={{ minWidth: 120 }}
                size="large"
              >
                搜索
              </Button>
            </Box>
          </Box>

          {results.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                搜索結果 ({results.length})
              </Typography>
              <List>
                {results.map((paper) => (
                  <div key={paper.id}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" component="div">
                            {paper.title}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              作者：{paper.authors.join(', ')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              摘要：{paper.abstract}
                            </Typography>
                            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {paper.keywords?.map((keyword) => (
                                <Chip key={keyword.id} label={keyword.word} size="small" />
                              ))}
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </div>
                ))}
              </List>
            </Box>
          )}

          {results.length === 0 && !loading && query && (
            <Typography variant="body1" sx={{ mt: 4, textAlign: 'center' }}>
              沒有找到相關論文
            </Typography>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default Search;
