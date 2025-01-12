// Pastikan untuk menyertakan import yang diperlukan
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

//import API key from env
const apikey = process.env.GEMINIAPIKEY;

const fileManager = new GoogleAIFileManager(apikey);

//get functions
import { getAllStock, getStock, getStockPrice } from "./stockServices.js";

// Fungsi untuk menghasilkan konten berdasarkan file yang diunggah
async function generateContent(message) {
  try {
    const genAI = new GoogleGenerativeAI(apikey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    //console.log("Generating content based on message:", message);
    const result = await model.generateContent(message);

    //console.log("Generated content:", result.response.text());
    const input = result.response.text();
    //console.log(input);
    return input;
  } catch (error) {
    console.error("Error during content generation:", error);
  }
}

// Parsing stock dari message yang dideteksi sebagai tag stock
const extractStockSymbols = (message) => {
  // Regex untuk mendeteksi kode saham dalam format $SYMBOL/SYMBOL
  const stockRegex = /\$([A-Z]+)\/\1/g;

  // Cocokkan semua kode saham dari pesan
  const matches = message.match(stockRegex);

  if (matches) {
    // Bersihkan simbol saham dari "$" dan "/SYMBOL" agar lebih mudah diproses
    return matches.map((stock) => stock.replace(/\$|\/[A-Z]+/g, ""));
  }

  return []; // Jika tidak ada kecocokan, kembalikan array kosong
};

const extractFirstStockSymbol = (message) => {
  // Regex untuk mendeteksi kode saham dalam format $SYMBOL (tanpa /SYMBOL)
  const stockRegex = /\$([A-Z]+)(?=\s|$)/g;

  // Cocokkan semua kode saham dari pesan
  const matches = message.match(stockRegex);

  if (matches && matches.length > 0) {
    // Hanya ambil kode saham pertama dan bersihkan simbol "$"
    return matches[0].replace("$", "");
  }

  return null; // Jika tidak ada kecocokan, kembalikan null
};

const chatAI = async (message) => {
  try {
    //parsing stock dari message yang dideteksi sebagai tag stock : $AADI/AADI $AAPL/AAPL $ABNB/ABNB
    const stock = extractFirstStockSymbol(message);
    console.log("Detected stock symbol:", stock);

    if (!stock) {
      return { message: "No stock symbol detected in message" };
    }

    //ambil data stock dari API
    const rawStockData = await getStockPrice(stock);
    const dataStock = await getStock(stock);
    const stockHistory = await getStock(stock);
    const stockData = dataStock[0];
    const stockDatas = rawStockData.quoteResponse.result[0];
    const text = `
      ${message}

      Stock Information:
  - Stock Code: ${stockData.Code}
  - Company Name: ${stockData.Name}
  - Head Office: ${stockData.HeadOffice}
  - Phone: ${stockData.Phone}
  - Representative: ${stockData.RepresentativeName}
  - Website: ${stockData.WebsiteUrl}
  - Address: ${stockData.Address}
  - Total Employees: ${stockData.TotalEmployees}
  - Exchange Administration: ${stockData.ExchangeAdministration}
  - Listing Date: ${new Date(stockData.ListingDate).toLocaleDateString()}
  - General Information: ${stockData.GeneralInformation}
  
  IPO Information:
  - IPO Price: ${stockData.StockIpoes[0].Price}
  - Offer Period: ${new Date(
    stockData.StockIpoes[0].OfferStart
  ).toLocaleDateString()} to ${new Date(
      stockData.StockIpoes[0].OfferEnd
    ).toLocaleDateString()}
  - Listed Shares: ${stockData.StockIpoes[0].ListedShares}
  - Percentage of Shares Listed: ${stockData.StockIpoes[0].PctShareListed}%
  - Nominal: ${stockData.StockIpoes[0].Nominal}
  - Line of Business: ${stockData.StockIpoes[0].LineBusiness}
  - Website: ${stockData.StockIpoes[0].Website}
  
      Stock Price Information:
      - Language: ${stockDatas.language}
      - Region: ${stockDatas.region}
      - Quote Type: ${stockDatas.quoteType} (${stockDatas.typeDisp})
      - Source Name: ${stockDatas.quoteSourceName}
      - Triggerable: ${stockDatas.triggerable}
      - Custom Price Alert Confidence: ${stockDatas.customPriceAlertConfidence}
      - Currency: ${stockDatas.currency}
      - Regular Market Time: ${new Date(
        stockDatas.regularMarketTime * 1000
      ).toLocaleString()}
      - Exchange: ${stockDatas.exchange}
      - Exchange Timezone: ${stockDatas.exchangeTimezoneName} (${
      stockDatas.exchangeTimezoneShortName
    })
      - GMT Offset: ${stockDatas.gmtOffSetMilliseconds / 3600000} hours
      - Market: ${stockDatas.market}
      - ESG Populated: ${stockDatas.esgPopulated}
      - Market State: ${stockDatas.marketState}
      - Regular Market Change Percent: ${stockDatas.regularMarketChangePercent.toFixed(
        2
      )}%
      - Regular Market Price: ${stockDatas.regularMarketPrice} ${
      stockDatas.currency
    }
      - Regular Market Change: ${stockDatas.regularMarketChange} ${
      stockDatas.currency
    }
      - Pre/Post Market Data: ${stockDatas.hasPrePostMarketData}
      - First Trade Date: ${new Date(
        stockDatas.firstTradeDateMilliseconds
      ).toLocaleString()}
      - Price Hint: ${stockDatas.priceHint}
      - Regular Market Previous Close: ${
        stockDatas.regularMarketPreviousClose
      } ${stockDatas.currency}
      - Full Exchange Name: ${stockDatas.fullExchangeName}
      - Source Interval: ${stockDatas.sourceInterval} seconds
      - Exchange Data Delayed By: ${stockDatas.exchangeDataDelayedBy} seconds
      - Tradeable: ${stockDatas.tradeable}
      - Crypto Tradeable: ${stockDatas.cryptoTradeable}
      - Symbol: ${stockDatas.symbol}
      `;

    //console.log("Generated text:", text);

    const result = await generateContent(text);

    return { message: "Success", result: result };
  } catch (error) {
    console.error("Error during chat AI processing:", error);
    return { message: "Failed", error: error };
  }
};

export { chatAI };
