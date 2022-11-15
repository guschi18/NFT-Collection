// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";


// "is ERC721Enumerable, Ownable" bedeutet, das wir diese beiden 
// von openzeppelin importieren
contract Cannben is ERC721Enumerable, Ownable {

string _baseTokenURI;

IWhitelist whitelist; 

bool public presaleStarted;

uint256 public presaleEnded;

uint256 public maxTokenIds = 20; 

uint256 public tokenIds;

uint256 public _presalePrice = 0.005 ether;

uint256 public _publicPrice = 0.01 ether;

bool public _paused; 

modifier onlyWhenNotPaused{
    require(!_paused, "Der Contract wurde zurzeit angehalten");
    _;
}



// ERC721 constructor habeinhaltett den "Namen" und das "Symbol" für die Token Collection
// _baseURI ist = Einleitung in die Collection. Basisteil für ein Projekt ( Baselocation )
constructor(string memory baseURI, address whitelistContract) ERC721("CannBen", "CB"){
_baseTokenURI = baseURI;
whitelist = IWhitelist(whitelistContract);
}

// onlyOwner = Zusatz, das diese Funktion nur der Owner vom Smart Contract aufrufen kann 
function startPresale() public onlyOwner {
    presaleStarted = true;
    presaleEnded = block.timestamp + 5 minutes;
}

//* Diese Funktion minted ein NFT ( presale) zum Sender unter bestimmen Vorraussetzunen
// require = prüfen ob bestimme Parameter gegeben sind, in diesem Fall ob der Vorverkauf bereits gestartet ist 
// und ob der Presale bereits beendet ist. + 3 weitere.
function presaleMint() public payable onlyWhenNotPaused  {
    require(presaleStarted && block.timestamp < presaleEnded, "Vorverkauf ist beendet");
    require(whitelist.whitelistedAddresses(msg.sender), "Du bist nicht in der Whitelist");
    require(tokenIds < maxTokenIds, "Limit bereits erreicht" ); 
    require(msg.value >= _presalePrice, "Zu wenig Ether gesendet");

    tokenIds +=1;

// _safeMint ist eine Funktion aus dem ERC721 Standart, Standart Mint Funktion
    _safeMint(msg.sender, tokenIds);
}

// Diese Funktion minted ein NFT ( nach dem presale )
function mint() public payable onlyWhenNotPaused {
    require(presaleStarted && block.timestamp >= presaleEnded, "Presale ist noch nicht beendet");
    require(tokenIds < maxTokenIds, "Limit bereits erreicht" ); 
    require(msg.value >= _publicPrice, "Zu wenig Ether gesendet");

     tokenIds +=1;

// _safeMint ist eine Funktion aus dem ERC721 Standart, Standart Mint Funktion
    _safeMint(msg.sender, tokenIds);
}

// override = überschreiben
 function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
 }

// mit dieser Funktion kann der Contract angehalten werden und alle Funktionen werden gestoppt
 function setPaused(bool val) public onlyOwner {
    _paused = val;
 }

// Das ist die Funktion um vom SmartContract die Ether zum Besitzer des Contracts auszuzahlen
//* Owner() ist eine vor konfigurierte Funktion auf dem ERC721 Standart Contract
// "_owner.call{value: amount}("");" ist eine Standart Line vom Code ( in jedem Code ) um Ether zu senden
// siehe solidity-by-example.org
function withdraw() public onlyOwner {
    address _owner = owner();
    uint256 amount = address(this).balance;
    (bool sent,) = _owner.call{value: amount}("");
    require(sent, "Ether senden Fehlgeschlagen!");
}




// Funktion um Ether zu empfangen
receive() external payable{}

// Funktion wird aufgerufen wenn msg.data noch nicht leer (empty) ist 
fallback() external payable{}





}