const truffleAssert = require('truffle-assertions');

// This script is designed to test the solidity smart contract - SuppyChain.sol -- and the various functions within
// Declare a variable and assign the compiled smart contract artifact
const SupplyChain = artifacts.require('SupplyChain');

contract('SupplyChain', async (accounts) => {
    // Declare few constants and assign a few sample accounts generated by ganache-cli
		let supplyChain;

    let sku = 1;
    let upc = 1;

    const ownerID = accounts[0];
    const originFarmerID = accounts[1];
		const distributorID = accounts[2];
    const retailerID = accounts[3];
    const consumerID = accounts[4];

		const originFarmName = "John Doe";
    const originFarmInformation = "Yarray Valley";
    const originFarmLatitude = "-38.239770";
    const originFarmLongitude = "144.341490";
    let productID = sku + upc;
    const productNotes = "Best beans for Espresso";
    const productPrice = web3.utils.toWei('1', "ether");

    const emptyAddress = '0x00000000000000000000000000000000000000';
		const itemState = {
			Harvested: 0,
    	Processed: 1,
    	Packed: 2,
    	ForSale: 3,
    	Sold: 4,
    	Shipped: 5,
    	Received: 6,
    	Purchased: 7
		};

    ///Available Accounts
    ///==================
    ///(0) 0x27d8d15cbc94527cadf5ec14b69519ae23288b95
    ///(1) 0x018c2dabef4904ecbd7118350a0c54dbeae3549a
    ///(2) 0xce5144391b4ab80668965f2cc4f2cc102380ef0a
    ///(3) 0x460c31107dd048e34971e57da2f99f659add4f02
    ///(4) 0xd37b7b8c62be2fdde8daa9816483aebdbd356088
    ///(5) 0x27f184bdc0e7a931b507ddd689d76dba10514bcb
    ///(6) 0xfe0df793060c49edca5ac9c104dd8e3375349978
    ///(7) 0xbd58a85c96cc6727859d853086fe8560bc137632
    ///(8) 0xe07b5ee5f738b2f87f88b99aac9c64ff1e0c7917
    ///(9) 0xbd3ff2e3aded055244d66544c9c059fa0851da44

    console.log("ganache-cli accounts used here...");
    console.log("Contract Owner: accounts[0] ", ownerID);
    console.log("Farmer: accounts[1] ", originFarmerID);
    console.log("Distributor: accounts[2] ", distributorID);
    console.log("Retailer: accounts[3] ", retailerID);
    console.log("Consumer: accounts[4] ", consumerID);

		before(async () => {
			supplyChain = await SupplyChain.deployed();
			await supplyChain.addFarmer(originFarmerID);
			await supplyChain.addDistributor(distributorID);
			await supplyChain.addRetailer(retailerID);
			await supplyChain.addConsumer(consumerID);
		});


    // 1st Test
    it("Testing smart contract function harvestItem() that allows a farmer to harvest coffee", async() => {

				// Mark an item as Harvested by calling function harvestItem()
        const tx = await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes);

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU');
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC');
        assert.equal(resultBufferOne[2], ownerID, 'Error: Missing or Invalid ownerID');
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID');
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName');
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation');
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude');
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude');
        assert.equal(resultBufferTwo[5], itemState.Harvested, 'Error: Invalid item State');
				truffleAssert.eventEmitted(tx, 'Harvested', (evt) => { return evt.upc = upc});
    })    

    // 2nd Test
    it("Testing smart contract function processItem() that allows a farmer to process coffee", async() => {
        
        // Mark an item as Processed by calling function processtItem()
				const tx = await supplyChain.processItem(upc, { from: originFarmerID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
				const resultBufferOne = await supplyChain.fetchItemBufferOne(upc);
				const resultBufferTwo = await supplyChain.fetchItemBufferTwo(upc);

        // Verify the result set
				assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU');
				assert.equal(resultBufferTwo[5], itemState.Processed, 'Error: Invalid item State');
				truffleAssert.eventEmitted(tx, 'Processed', (evt) => { return evt.upc = upc});
    });

    // 3rd Test
    it("Testing smart contract function packItem() that allows a farmer to pack coffee", async() => {
        
        // Mark an item as Packed by calling function packItem()
        const tx = await supplyChain.packItem(upc);

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne(upc);
				const resultBufferTwo = await supplyChain.fetchItemBufferTwo(upc);

        // Verify the result set
				assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU');
				assert.equal(resultBufferTwo[5], itemState.Packed, 'Error: Invalid item State');
				truffleAssert.eventEmitted(tx, 'Packed', (evt) => { return evt.upc = upc});
    });

    // 4th Test
    it("Testing smart contract function sellItem() that allows a farmer to sell coffee", async() => {
        
        // Mark an item as ForSale by calling function sellItem()
        const tx = await supplyChain.sellItem(upc, productPrice);

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
				const resultBufferOne = await supplyChain.fetchItemBufferOne(upc);
				const resultBufferTwo = await supplyChain.fetchItemBufferTwo(upc);

        // Verify the result set
				assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU');
				assert.equal(resultBufferTwo[4], productPrice, 'Error: Invalid item State');
				assert.equal(resultBufferTwo[5], itemState.ForSale, 'Error: Invalid item State');
				truffleAssert.eventEmitted(tx, 'ForSale', (evt) => { return evt.upc = upc});
    });

    // 5th Test
    it("Testing smart contract function buyItem() that allows a distributor to buy coffee", async() => {

				const farmerStartingBalance = await web3.eth.getBalance(originFarmerID);
				const distributorBuyPrice = web3.utils.toWei("2", "ether");

        // Mark an item as Sold by calling function buyItem()
				const tx = await supplyChain.buyItem(upc, { from: distributorID, value: distributorBuyPrice});

				const farmerEndBalance = await web3.eth.getBalance(originFarmerID);

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne(upc);
				const resultBufferTwo = await supplyChain.fetchItemBufferTwo(upc);

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU');
				assert.equal(resultBufferTwo[5], itemState.Sold, 'Error: Invalid item State');
				assert.equal(resultBufferOne[2], distributorID, 'Error: Invalid item owner');
				assert.equal(resultBufferTwo[6], distributorID, 'Error: Invalid distributor id');
				assert.equal(farmerEndBalance - farmerStartingBalance, productPrice);
				truffleAssert.eventEmitted(tx, 'Sold', (evt) => { return evt.upc = upc});
    });

    // 6th Test
    it("Testing smart contract function shipItem() that allows a distributor to ship coffee", async() => {
        
        // Mark an item as Sold by calling function buyItem()
        const tx = await supplyChain.shipItem(upc, {from: distributorID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne(upc);
				const resultBufferTwo = await supplyChain.fetchItemBufferTwo(upc);

        // Verify the result set
				assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU');
				assert.equal(resultBufferTwo[5], itemState.Shipped, 'Error: Invalid item State');
				truffleAssert.eventEmitted(tx, 'Shipped', (evt) => { return evt.upc = upc});
    });

    // 7th Test
    it("Testing smart contract function receiveItem() that allows a retailer to mark coffee received", async() => {
        
				// Mark an item as Sold by calling function buyItem()
        const tx = await supplyChain.receiveItem(upc, {from: retailerID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
				const resultBufferOne = await supplyChain.fetchItemBufferOne(upc);
				const resultBufferTwo = await supplyChain.fetchItemBufferTwo(upc);

        // Verify the result set
				assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU');
				assert.equal(resultBufferTwo[5], itemState.Received, 'Error: Invalid item State');
				assert.equal(resultBufferOne[2], retailerID, 'Error: Invalid owner id');
				assert.equal(resultBufferTwo[7], retailerID, 'Error: Invalid retailer id');
				truffleAssert.eventEmitted(tx, 'Received', (evt) => { return evt.upc = upc});
    });

    // 8th Test
    it("Testing smart contract function purchaseItem() that allows a consumer to purchase coffee", async() => {
        
        // Mark an item as Sold by calling function buyItem()
        const tx = await supplyChain.purchaseItem(upc, {from: consumerID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne(upc);
				const resultBufferTwo = await supplyChain.fetchItemBufferTwo(upc);

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU');
				assert.equal(resultBufferTwo[5], itemState.Purchased, 'Error: Invalid item State');
				assert.equal(resultBufferOne[2], consumerID, 'Error: Invalid owner id');
				assert.equal(resultBufferTwo[8], consumerID, 'Error: Invalid consumer id');
				truffleAssert.eventEmitted(tx, 'Purchased', (evt) => { return evt.upc = upc});
    });

    // 9th Test
    it("Testing smart contract function fetchItemBufferOne() that allows anyone to fetch item details from blockchain", async() => {

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultOne = await supplyChain.fetchItemBufferOne(upc);
        
        // Verify the result set:
        assert.equal(sku, resultOne[0], 'Error: Invalid sku');
				assert.equal(upc, resultOne[1], 'Error: Invalid puc');
				assert.equal(consumerID, resultOne[2], 'Error: Invalid owner id');
				assert.equal(originFarmerID, resultOne[3], 'Error: Invalid farmer id');
				assert.equal(originFarmName, resultOne[4], 'Error: Invalid farmer name');
				assert.equal(originFarmInformation, resultOne[5], 'Error: Invalid farmer information');
				assert.equal(originFarmLatitude, resultOne[6], 'Error: Invalid farm latitude');
				assert.equal(originFarmLongitude, resultOne[7], 'Error: Invalid farm longitude');
    });

    // 10th Test
    it("Testing smart contract function fetchItemBufferTwo() that allows anyone to fetch item details from blockchain", async() => {

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultTwo = await supplyChain.fetchItemBufferTwo(upc);
        
        // Verify the result set:
        assert.equal(sku, resultTwo[0], 'Error: Invalid sku');
				assert.equal(upc, resultTwo[1], 'Error: Invalid upc');
				assert.equal(productID, resultTwo[2], 'Error: Invalid product id');
				assert.equal(productNotes, resultTwo[3], 'Error: Invalid product nodes');
				assert.equal(productPrice, resultTwo[4], 'Error: Invalid product price');
				assert.equal(itemState.Purchased, resultTwo[5], 'Error: Invalid item state');
				assert.equal(distributorID, resultTwo[6], 'Error: Invalid distributor id');
				assert.equal(retailerID, resultTwo[7], 'Error: Invalid retailer id');
				assert.equal(consumerID, resultTwo[8], 'Error: Invalid consumer id');
    });

});

