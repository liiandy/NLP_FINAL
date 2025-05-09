import fitz  # PyMuPDF
import logging
from docx import Document
import os
from typing import Dict, List, Optional, Tuple, Any
import nltk
from nltk.tokenize import sent_tokenize
try:
    from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
except ImportError:
    pipeline = None
    AutoTokenizer = None
    AutoModelForSeq2SeqLM = None
    logging.error("Transformers import failed; summarization disabled")
try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    SentenceTransformer = None
    import logging
    logging.error("SentenceTransformer import failed; similarity and summarization pipelines disabled")
import numpy as np
import logging
import torch
from ..core.config import settings
from fastapi import HTTPException
from openai import AsyncOpenAI
import json

# 設置日誌
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 下載必要的 NLTK 數據
try:
    nltk.download('punkt', quiet=True)
    nltk.download('averaged_perceptron_tagger', quiet=True)
    nltk.download('stopwords', quiet=True)
    logger.info("NLTK 數據下載完成")
except Exception as e:
    logger.error(f"下載 NLTK 數據時發生錯誤: {str(e)}")

# 全局變量用於緩存模型
_summarizer = None
_sentence_model = None

class PaperProcessor:
    def __init__(self):
        global _summarizer, _sentence_model
        
        # 初始化 OpenAI 客戶端
        try:
            self.openai_client = AsyncOpenAI(
                api_key=settings.OPENAI_API_KEY
            )
            logger.info("OpenAI 客戶端初始化完成")
        except Exception as e:
            logger.error(f"初始化 OpenAI 客戶端時發生錯誤: {str(e)}")
            self.openai_client = None

        # 使用緩存的模型或創建新模型
        if _summarizer is None:
            try:
                logger.info("正在加載摘要模型...")
                # 使用更小的模型
                model_name = "facebook/bart-base"  # 改用更小的模型
                tokenizer = AutoTokenizer.from_pretrained(model_name)
                model = AutoModelForSeq2SeqLM.from_pretrained(
                    model_name,
                    low_cpu_mem_usage=True,
                    torch_dtype=torch.float32
                )
                _summarizer = pipeline(
                    "summarization",
                    model=model,
                    tokenizer=tokenizer,
                    device=-1,  # 使用 CPU
                    model_kwargs={
                        "low_cpu_mem_usage": True,
                        "torch_dtype": torch.float32
                    }
                )
                logger.info("摘要模型加載完成")
            except Exception as e:
                logger.error(f"加載摘要模型時發生錯誤: {str(e)}", exc_info=True)
                _summarizer = None
                
        if _sentence_model is None:
            if SentenceTransformer:
                try:
                    logger.info("正在加載句子模型...")
                    _sentence_model = SentenceTransformer(
                        'all-MiniLM-L6-v2',
                        device='cpu',
                        cache_folder=os.path.join(os.path.expanduser("~"), ".cache", "sentence_transformers")
                    )
                    logger.info("句子模型加載完成")
                except Exception as e:
                    logger.error(f"加載句子模型時發生錯誤: {str(e)}", exc_info=True)
                    _sentence_model = None
            else:
                _sentence_model = None
            
        self.summarizer = _summarizer
        self.sentence_model = _sentence_model
        self.upload_folder = settings.UPLOAD_FOLDER
        
        # 確保上傳目錄存在
        try:
            os.makedirs(self.upload_folder, exist_ok=True)
            logger.info(f"上傳目錄已創建/確認: {self.upload_folder}")
        except Exception as e:
            logger.error(f"創建上傳目錄時發生錯誤: {str(e)}", exc_info=True)
            raise

    def translate_to_chinese(self, text: str) -> str:
        """將文本翻譯成繁體中文"""
        try:
            # 使用更適合繁體中文翻譯的模型
            translator = Translator(to_lang='zh-tw')
            translated = translator.translate(text)
            
            # 確保輸出為繁體中文
            # 將簡體中文轉換為繁體中文
            translated = self._convert_to_traditional(translated)
            
            # 替換標點符號為繁體中文標點
            punctuation_map = {
                '"': '"',
                '"': '"',
                "'": "'",
                "'": "'",
                '...': '…',
                '--': '—',
                '!': '！',
                '?': '？',
                ',': '，',
                '.': '。',
                ';': '；',
                ':': '：',
                '(': '（',
                ')': '）',
                '[': '［',
                ']': '］',
                '{': '｛',
                '}': '｝',
                '<': '〈',
                '>': '〉',
                '/': '／',
                '\\': '＼',
                '|': '｜',
                '@': '＠',
                '#': '＃',
                '$': '＄',
                '%': '％',
                '^': '︿',
                '&': '＆',
                '*': '＊',
                '+': '＋',
                '=': '＝',
                '~': '～',
                '`': '｀'
            }
            
            for eng, trad in punctuation_map.items():
                translated = translated.replace(eng, trad)
            
            return translated
        except Exception as e:
            logger.error(f"翻譯時發生錯誤: {str(e)}")
            return text

    def _convert_to_traditional(self, text: str) -> str:
        """將簡體中文轉換為繁體中文"""
        try:
            # 使用 OpenCC 進行轉換
            import opencc
            converter = opencc.OpenCC('s2t')  # 簡體到繁體
            return converter.convert(text)
        except Exception as e:
            logger.error(f"轉換繁體中文時發生錯誤: {str(e)}")
            return text

    def extract_text_from_pdf(self, file_path: str) -> str:
        """從 PDF 文件中提取文本"""
        try:
            logger.info(f"正在從 PDF 提取文本: {file_path}")
            doc = fitz.open(file_path)
            text = ""
            for page in doc:
                text += page.get_text()
            logger.info("PDF 文本提取完成")
            return text
        except Exception as e:
            logger.error(f"從 PDF 提取文本時發生錯誤: {str(e)}", exc_info=True)
            raise

    def extract_text_from_docx(self, file_path: str) -> str:
        """從 DOCX 文件中提取文本"""
        try:
            logger.info(f"正在從 DOCX 提取文本: {file_path}")
            doc = Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            logger.info("DOCX 文本提取完成")
            return text
        except Exception as e:
            logger.error(f"從 DOCX 提取文本時發生錯誤: {str(e)}", exc_info=True)
            raise

    def extract_text(self, file_path: str) -> str:
        """根據文件類型提取文本"""
        try:
            file_ext = os.path.splitext(file_path)[1].lower()
            if file_ext == '.pdf':
                return self.extract_text_from_pdf(file_path)
            elif file_ext == '.docx':
                return self.extract_text_from_docx(file_path)
            else:
                raise ValueError(f"不支援的文件類型: {file_ext}")
        except Exception as e:
            logger.error(f"提取文本時發生錯誤: {str(e)}", exc_info=True)
            raise

    def extract_metadata(self, text: str) -> Dict[str, str]:
        """提取論文的基本元數據"""
        lines = text.split('\n')
        metadata = {
            'title': '',
            'authors': [],
            'journal': '',
            'year': '',
            'keywords': [],
        }
        
        # 標題通常跨多行，收集首段連續非空行直到空行或作者標記，合併為完整標題
        title_lines: List[str] = []
        author_markers = ['Authors:', 'Author:', 'By:', 'Written by:', 'Contributors:']
        for l in lines:
            clean = l.strip()
            if not clean or any(marker.lower() in clean.lower() for marker in author_markers):
                break
            title_lines.append(clean)
        metadata['title'] = ' '.join(title_lines)
        
        # 作者提取邏輯
        author_patterns = [
            r'^[A-Z][a-z]+ [A-Z][a-z]+(?:, [A-Z][a-z]+ [A-Z][a-z]+)*$',  # 標準格式：John Smith, Jane Doe
            r'^[A-Z][a-z]+ [A-Z][a-z]+ et al\.$',  # 帶 et al. 的格式
            r'^[A-Z][a-z]+ [A-Z][a-z]+ and [A-Z][a-z]+ [A-Z][a-z]+$',  # 使用 and 連接的格式
            r'^[A-Z][a-z]+ [A-Z][a-z]+; [A-Z][a-z]+ [A-Z][a-z]+$',  # 使用分號分隔的格式
            r'^[A-Z][a-z]+ [A-Z][a-z]+ & [A-Z][a-z]+ [A-Z][a-z]+$',  # 使用 & 連接的格式
        ]
        
        import re
        author_lines = []
        
        # 檢查前 20 行尋找作者信息
        for line in lines[1:20]:
            line = line.strip()
            if not line:
                continue
                
            # 檢查是否匹配任何作者模式
            for pattern in author_patterns:
                if re.match(pattern, line):
                    author_lines.append(line)
                    break
            
            # 檢查是否包含常見的作者標記
            author_markers = ['Authors:', 'Author:', 'By:', 'Written by:', 'Contributors:']
            for marker in author_markers:
                if marker in line:
                    author_lines.append(line.replace(marker, '').strip())
                    break
        
        # 處理找到的作者行
        for author_line in author_lines:
            # 移除 et al.
            author_line = author_line.replace('et al.', '').strip()
            
            # 根據不同的分隔符分割作者
            if ' and ' in author_line:
                authors = author_line.split(' and ')
            elif ';' in author_line:
                authors = author_line.split(';')
            elif ' & ' in author_line:
                authors = author_line.split(' & ')
            elif ',' in author_line:
                authors = author_line.split(',')
            else:
                authors = [author_line]
            
            # 清理並添加作者
            for author in authors:
                author = author.strip()
                if author and author not in metadata['authors']:
                    metadata['authors'].append(author)
        
        # 尋找期刊和年份
        for line in lines:
            line = line.lower()
            # 期刊識別
            if any(journal in line for journal in ['journal', 'conference', 'proceedings', 'transactions']):
                metadata['journal'] = line.strip()
            # 年份識別（4位數字）
            if re.search(r'\b(19|20)\d{2}\b', line):
                year_match = re.search(r'\b(19|20)\d{2}\b', line)
                if year_match:
                    metadata['year'] = year_match.group()
        
        return metadata

    async def generate_summary(self, text: str) -> Dict[str, str]:
        """使用 GPT-4 直接對全文進行摘要"""
        try:
            if not text or not text.strip():
                return {"content": "摘要內容不可用", "language": "zh-TW"}

            response = await self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "你是一位專業的學術論文摘要專家。請閱讀以下完整論文內容，並以繁體中文撰寫一段精煉摘要，突出論文的主要貢獻和發現。"
                    },
                    {
                        "role": "user",
                        "content": text[:10000]
                    }
                ],
                temperature=0.3,
                max_tokens=1000
            )

            summary = response.choices[0].message.content.strip()
            return {"content": summary, "language": "zh-TW"}
        except Exception as e:
            logger.error(f"生成摘要時發生錯誤: {str(e)}")
            return {"content": "生成摘要時發生錯誤", "language": "zh-TW"}

    def extract_keywords(self, text: str) -> List[str]:
        """提取關鍵詞"""
        try:
            # 使用 NLTK 進行分詞和詞性標註
            tokens = nltk.word_tokenize(text.lower())
            tagged = nltk.pos_tag(tokens)
            
            # 只保留名詞、動詞和形容詞
            filtered_words = [word for word, tag in tagged if tag.startswith(('NN', 'VB', 'JJ'))]
            
            # 移除停用詞
            stop_words = set(nltk.corpus.stopwords.words('english'))
            filtered_words = [word for word in filtered_words if word not in stop_words and len(word) > 3]
            
            # 計算詞頻
            word_freq = {}
            for word in filtered_words:
                word_freq[word] = word_freq.get(word, 0) + 1
            
            # 按頻率排序並返回前 10 個關鍵詞
            keywords = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:10]
            
            # 返回關鍵詞列表
            return [word for word, _ in keywords]
            
        except Exception as e:
            logger.error(f"提取關鍵詞時發生錯誤: {str(e)}", exc_info=True)
            return []  # 如果出錯，返回空列表

    def calculate_similarity(self, text1: str, text2: str) -> float:
        """計算兩段文本的相似度"""
        if not self.sentence_model:
            return 0.0
            
        try:
            # 使用 sentence-transformers 計算文本嵌入
            embedding1 = self.sentence_model.encode(text1)
            embedding2 = self.sentence_model.encode(text2)
            
            # 計算餘弦相似度
            similarity = np.dot(embedding1, embedding2) / (np.linalg.norm(embedding1) * np.linalg.norm(embedding2))
            return float(similarity)
        except Exception as e:
            print(f"Error calculating similarity: {e}")
            return 0.0

    async def process_paper(self, file_path: str) -> Dict[str, Any]:
        """處理論文文件"""
        try:
            text = self.extract_text(file_path)
            if not text:
                raise ValueError("無法從文件中提取文本")

            metadata = self.extract_metadata(text)

            topic = None
            keywords = []

            if self.openai_client:
                title_resp = await self.openai_client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are an academic paper parser. Extract paper metadata as JSON with keys: title(string), authors(list), journal(string), year(string), keywords(list), topic(string)."},
                        {"role": "user", "content": f"Parse metadata from the following academic paper text (first 10000 characters):\n\n{text[:10000]}"}
                    ],
                    temperature=0
                )
                try:
                    meta_json = json.loads(title_resp.choices[0].message.content.strip())
                    metadata['title'] = meta_json.get('title', metadata['title'])
                    metadata['authors'] = meta_json.get('authors', metadata['authors'])
                    metadata['year'] = meta_json.get('year', metadata['year'])
                    metadata['journal'] = meta_json.get('journal', metadata['journal'])
                    keywords = meta_json.get('keywords', [])
                    topic = meta_json.get('topic', None)
                except Exception:
                    logger.warning("GPT metadata parsing failed, fallback to local extraction.")

            # 本地摘要提取
            abstract = ""
            lines = text.split('\n')
            for i, line in enumerate(lines):
                if "abstract" in line.lower():
                    abstract_lines = []
                    for next_line in lines[i+1:]:
                        if next_line.strip() and not any(marker in next_line.lower() for marker in ["introduction", "keywords", "1."]):
                            abstract_lines.append(next_line.strip())
                        else:
                            break
                    abstract = " ".join(abstract_lines)
                    break

            if not abstract:
                abstract = text[:500]

            if self.openai_client:
                abstract_resp = await self.openai_client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are an academic paper abstract extractor. Provide a concise and accurate abstract in English."},
                        {"role": "user", "content": text[:5000]}
                    ],
                    temperature=0
                )
                abstract = abstract_resp.choices[0].message.content.strip()

            summary = await self.generate_summary(text)

            if not keywords:
                keywords = self.extract_keywords(text)

            return {
                "title": metadata.get('title', ''),
                "authors": metadata.get('authors', []),
                "journal": metadata.get('journal', ''),
                "year": metadata.get('year', ''),
                "abstract": abstract,
                "summary": summary,
                "keywords": keywords,
                "topic": topic or ''
            }
        except Exception as e:
            logger.error(f"處理論文時發生錯誤: {str(e)}", exc_info=True)
            raise
