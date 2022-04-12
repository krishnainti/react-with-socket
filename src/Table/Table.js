import React, { useState, useId, useEffect, useRef } from "react";

const socketEndPoint = "wss://production-esocket.delta.exchange";
const channel = "v2/ticker";

function Table() {
  const ws = useRef(null);
  const [tableData, setTableData] = useState([]);
  const ID = useId();

  useEffect(() => {
    // fetch("https://api.delta.exchange/v2/products?page_size=30")
    fetch("https://api.delta.exchange/v2/products")
      .then((data) => data.json())
      .then((res) => {
        const symbolList = [
          ...new Set(res?.result?.map((item) => item.symbol)),
        ];

        ws.current = new WebSocket(socketEndPoint);

        ws.current.onopen = () => {
          ws.current.send(
            JSON.stringify({
              type: "subscribe",
              payload: {
                channels: [
                  {
                    name: channel,
                    symbols: symbolList,
                  },
                ],
              },
            })
          );
        };

        ws.current.onmessage = (evt) => {
          const message = JSON.parse(evt.data);
          if (message.type === channel) {
            setTableData((prev) => {
              let index = prev.findIndex((item) => {
                return item.symbol === message.symbol;
              });
              prev[index].price = message.mark_price;
              return [...prev];
            });
          }
        };

        setTableData([
          ...res?.result.map((item) => {
            return {
              symbol: item.symbol,
              description: item.description,
              underlying_asset: item.underlying_asset?.symbol,
              price: 0,
            };
          }),
        ]);
      });

    return () => {
      return ws && ws.current.close();
    };
  }, []);

  return (
    <>
      <div>
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 relative">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
            <tr>
              <th scope="col" className="px-6 py-3">
                Symbol
              </th>
              <th scope="col" className="px-6 py-3">
                Description
              </th>
              <th scope="col" className="px-6 py-3">
                Underlying Asset
              </th>
              <th scope="col" className="px-6 py-3">
                Mark Price
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((item, index) => {
              return (
                <tr
                  key={`${ID}-${index}`}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap"
                  >
                    {item.symbol}
                  </th>
                  <td className="px-6 py-4">{item.description}</td>
                  <td className="px-6 py-4">{item.underlying_asset}</td>
                  <td className="px-6 py-4">{item.price}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default React.memo(Table);
