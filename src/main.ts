import 'dotenv/config';
import app from './interface/http/server';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Address Validator API running on port ${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api/docs`);
}); 