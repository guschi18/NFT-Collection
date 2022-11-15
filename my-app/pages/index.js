import Head from "next/head";
import { useEffect, useRef, useState} from "react";
import { providers, Contract, utils } from "ethers"; 
import styles from "../styles/Home.module.css";
// Web3Modal ist für die Connection zu MetaMask notwendig
import Web3Modal from "web3modal";
import { NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS } from "../constans";

export default function Home() {
  const [isOwner, setIsOwner] = useState(false);
  const [presaleStarted, setPresaleStarted] = useState(false);
  const [presaleEnded, setPresaleEnded] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [numTokensMinted, setNumTokensMinted] = useState("");
  const web3ModalRef = useRef();

  const getNumMintedTokens = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );

      const numTokenIds = await nftContract.tokenIds();
      setNumTokensMinted(numTokenIds.toString());
    } catch (error) {
      console.error(error)
    }
  };

  const presaleMint = async () => {
    setLoading(true);
try {
  const signer = await getProviderOrSigner(true);

  const nftContract = new Contract(
    NFT_CONTRACT_ADDRESS,
    NFT_CONTRACT_ABI,
    signer
  );

  const txn = await nftContract.presaleMint({
    value: utils.parseEther("0.005"),
  });
  await txn.wait();

  window.alert("Du hast erfolgreich ein CannBen NFT gemintet");
  } catch (error){
    console.error(error)
  }
  setLoading(false);
  };

  const publicMint = async () => {
    setLoading(true);
  try {
    const signer = await getProviderOrSigner(true);
  
    const nftContract = new Contract(
      NFT_CONTRACT_ADDRESS,
      NFT_CONTRACT_ABI,
      signer
    );
  
    const txn = await nftContract.mint({
      value: utils.parseEther("0.01"),
    });
    await txn.wait();
  
    window.alert("Du hast erfolgreich ein CannBen NFT gemintet");
    } catch (error){
      console.error(error)
    }
    setLoading(false);
  };

  const getOwner = async () => {
    try {
      const signer = await getProviderOrSigner(true);

      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );

      const owner = await nftContract.owner();
      const userAddress= await signer.getAddress();

      if (owner.toLowerCase()  === userAddress.toLowerCase()) {
        setIsOwner(true);
      }

    } catch (error) {
      console.error(error)
    }
  };

  const startPresale = async () => {
    setLoading(true);
    try {
    const signer = await getProviderOrSigner(true);

    const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer);

    const txn = await nftContract.startPresale();
    await txn.wait();

    setPresaleStarted(true);
  } catch (error) {
    console.error(error)
  }
  setLoading(false);
  };

  const checkIfPresaleEnded = async () => {
  try {
    const provider = await getProviderOrSigner();

    
    const nftContract = new Contract(
      NFT_CONTRACT_ADDRESS,
      NFT_CONTRACT_ABI,
      provider
    );

    // Das wird eine große Zahl ausgeben aufgrund von uint256
    // Das wird einen Zeitspempel in Sekunden wiedergeben
    const presaleEndTime = await nftContract.presaleEnded();
    const currentTimeInSeconds = Date.now() /1000;
    const hasPresaleEnded = presaleEndTime.lt(Math.floor(currentTimeInSeconds));

    setPresaleEnded(hasPresaleEnded);
  } catch (error) {
    console.error(error)
  } 
  };

  const checkIfPresaleStartded = async () => {
  try {

    const provider = await getProviderOrSigner();

    
    const nftContract = new Contract(
      NFT_CONTRACT_ADDRESS,
      NFT_CONTRACT_ABI,
      provider
    );

    const isPresaleStarted = await nftContract.presaleStarted();
    setPresaleStarted(isPresaleStarted);

    return isPresaleStarted;
  } catch ( error ) {
    console.error(error)
    return false;
  }
  };

  const connectWallet = async () => {
    try {
    // Update "walletConnect" zu richtig 
    await getProviderOrSigner();
    setWalletConnected(true);
  } catch (error) {
    console.error(error);
  }
  };

  const getProviderOrSigner = async (needSigner = false) => {
    // Wir brauchen Zugang zum Provider/Signer von MetaMask
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

  // Wenn der Nutzer kein Görli bentutz, weise ihn darauf hin, das er zu Görli wechselt
  const { chainId } = await web3Provider.getNetwork();
  if (chainId !== 5) {
    window.alert("Bitte zum Görli Netzwerk switchen");
    throw new Error("Falsches Netzwerk");
  }

  if (needSigner) {
    const signer = web3Provider.getSigner();
    return signer;
}

  return web3Provider;

  };

  const onPageLoad = async () => {
    await connectWallet();
    await getOwner();
    const presaleStarted = await checkIfPresaleStartded();
    if (presaleStarted) {
      await checkIfPresaleEnded();
    }
    await getNumMintedTokens();

    //Checken wieiviel NTFs bereits gemintet wurden
    setInterval(async () => {
      await getNumMintedTokens();
    }, 5 * 1000);

    //Presale Status checken in Realtime
    setInterval(async () => {

      const presaleStarted = await checkIfPresaleStartded();
      if (presaleStarted) {
        await checkIfPresaleEnded();
      }
    }, 5 * 1000)
  };

  useEffect(() => {
if (!walletConnected) {
  web3ModalRef.current = new Web3Modal({
    network: "goerli",
    providerOptions: {},
    disableInjectedProvider: false,
    });

  onPageLoad();

}
  }, []);
  
  function renderBody() {
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
        Verbinde dein Wallet
        </button> 
        );
    }

    if (loading) {
      return (
        <span className={styles.description}>Lädt...</span>
      );
    }


    if(isOwner && !presaleStarted) {
      //Button zum Start vom Presale
      return (
        <button onClick={startPresale} className={styles.button}>
          Presale starten
        </button>

      );
    }

    if (!presaleStarted) {
      // der presale hat noch nicht gestartet, komm später wieder
      return (
        <div>
          <span className={styles.description}>Der Presale hat noch nicht begonnen, komm später wieder!</span>
        </div>      );
    }

    if (presaleStarted && !presaleEnded) {
      // usern erlauben nfts zu minten
      // sie müssen dafür in der whitelist eingetragen sein
      return (
        <div>
          <span  className={styles.description}>
            Der Presale hat begonnen! Wenn du auf der Whitelist bist, kannst du dein CannBen NFT minten!
          </span>
          <button className={styles.button} onClick={presaleMint}>
            Presale Mint 🚀
          </button>
        </div>
      )
    }

    if (presaleEnded) {
      // erlaubt usern am public sale teilzunehmen
      return (
        <div>
          <span  className={styles.description}>
            Der Presale ist beendet. 
            Du kannst ein CannBen NFT im Public Verkauf minten.
          </span>
          <button className={styles.button} onClick={publicMint}>
            Public Mint 🚀
          </button>
        </div>
      )
    }

  };
  
  return (
    <div>
        <Head>
          <title>CannBen NFT</title>
        </Head>

        <div className={styles.main}>
          <div>
            <h1 className={styles.title}>Willkommen zu CannBen NFT</h1>
            <div className={styles.description}>CannBen NFT gehört zum Cannabis Shop CannBen</div>
            <div className={styles.description}>
              {numTokensMinted}/20 sind bereits geminted! 
            </div>
            {renderBody()} 
          </div>
          <img className={styles.image} src="/cryptodevs/0.svg.jpg" />
      </div>

      <footer className={styles.footer}>
        Gemacht mit &#10084; für CannBen
      </footer>
    </div>
    
  );
  }
