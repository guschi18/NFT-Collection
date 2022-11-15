// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

// Base URI + TokenID
// Base URI = https://example.com/
// TokenID = 1

// tokenURI(1) => https://example.com/1


export default function handler(req, res) {
    const tokenId = req.query.tokenId;
    
    const name = "CannBen #${tokenId}";
    const description = "CannBen ist ein NFT Collection für CannBen Kunden!";
    const image = "https://raw.githubusercontent.com/LearnWeb3DAO/NFT-Collection/main/my-app/public/cryptodevs/${Number(tokenId) - 1}.svg";

    return res.json({
    name: name,
    description: description,
    image: image,    
    });
}
