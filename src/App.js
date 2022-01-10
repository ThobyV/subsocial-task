import "./App.css";
import { useEffect, useMemo, useState } from "react";

const Spinner = () => <span className="spinner"></span>;

const NetworkStatus = ({ network, mock_api }) => {
  const [status, setStatus] = useState("pending");
  const status_url = "https://app.subsocial.network/subid/api/v1/check/";

  useEffect(() => {
    let delayId;
    let delayIntervalTime;

    async function runFetch() {
      const server = () => {
        delayIntervalTime = 300000;

        fetch(`${status_url}/${network}`)
          .then((data) => {
            data = data ? "connected" : "disconnected";
            setStatus(data);
          })
          .catch((e) => console.log(e));
      };

      const mock = () => {
        delayIntervalTime = 4000;
        setStatus(Math.random() < 0.8 ? "connected" : "disconnected");
      };

      const status = () => (mock_api ? mock() : server());
      status();
    }

    async function initialDelay() {
      const delay = new Promise((resolve, _) => {
        setTimeout(() => resolve(), 2000);
      });
      delay.then(() => {
        delayId = setInterval(() => runFetch(), delayIntervalTime);
      });
    }
    clearInterval(delayId);
    runFetch();
    initialDelay();
    return () => clearInterval(delayId);
  }, [mock_api]);

  return <span className={` btn ${status}`}>{`${status}`}</span>;
};

const NetworkItem = ({ item, mock_api }) => {
  const image_url = "https://sub.id/images/";
  const { tokenSymbol = [] } = item;
  return (
    <li className="grid-row space-b">
      <div className="flex-no-wrap items start">
        <div>
          <img className="flex-image" src={`${image_url}/${item.icon}`} />
        </div>
        <div>
          <div className="f-title">{item.network}</div>
          <div className="f-subtitle space-t-1">{tokenSymbol[0]}</div>
        </div>
      </div>
      <div>
        <NetworkStatus network={item.network} mock_api={mock_api} />
      </div>
    </li>
  );
};

const App = () => {
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mockApi, setMockApi] = useState(false);
  const networks_url =
    "https://app.subsocial.network/subid/api/v1/chains/properties";

  const toggleMockApi = () => setMockApi(!mockApi);

  const alphabeticalSort = useMemo(() => {
    return networks.sort((a, b) => {
      if (a.network < b.network) return -1;
      if (a.network > b.network) return 1;
      return 0;
    });
  }, [networks]);

  useEffect(() => {
    const runFetch = async () => {
      const addNetworkFields = (data) =>
        Object.entries(data).map(([network, data]) => ({
          ...data,
          network,
        }));

      fetch(networks_url)
        .then((stream) => stream.json())
        .then((data) => {
          setLoading(false);
          setNetworks(addNetworkFields(data));
        })
        .catch((e) => console.log(e));
    };
    runFetch();
  }, []);

  return (
    <div>
      <div className="center space-y">👋 Welcome to subsocial</div>
      <div className="s-container">
        {loading ? (
          <div className="space-all">
            <Spinner />
          </div>
        ) : (
          <div className="content">
            <div className="flex">
              <div className="space-all f-header-1">Networks</div>
              <div className="space-all f-header-1">
                <button
                  className="btn"
                  onClick={toggleMockApi}
                >{`mock network status: ${mockApi ? "on" : "off"}`}</button>
              </div>
            </div>
            <ul className="list flex rows">
              {alphabeticalSort.map((n) => (
                <NetworkItem item={n} mock_api={mockApi} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
