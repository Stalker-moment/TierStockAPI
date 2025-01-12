import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const Cookie = process.env.COOKIE;

const getAllStock = async () => {
  try {
    const response = await axios.get(`https://pasardana.id/api/stock/getall`);
    return response.data;
  } catch (error) {
    return error;
  }
};

const getStock = async (code) => {
  try {
    const response = await axios.get(`https://pasardana.id/api/stock/getall`);

    //filter stock by code
    const data = response.data;
    const stock = data.filter((stock) => stock.Code === code);
    return stock;
  } catch (error) {
    return error;
  }
};

const getStockPrice = async (code) => {
  try {
    const response = await axios.get(
      `https://query1.finance.yahoo.com/v7/finance/quote?&symbols=${code}.JK&fields=currency,fromCurrency,toCurrency,exchangeTimezoneName,exchangeTimezoneShortName,gmtOffSetMilliseconds,regularMarketChange,regularMarketChangePercent,regularMarketPrice,regularMarketTime,preMarketTime,postMarketTime,extendedMarketTime&crumb=navvPQP/gVE&formatted=false&region=US&lang=en-US`,
      {
        headers: {
          Cookie: Cookie,
        },
      }
    );

    // Filter stock by code
    const data = response.data;
    return data;
  } catch (error) {
    return error;
  }
};

export { getAllStock, getStock, getStockPrice };
