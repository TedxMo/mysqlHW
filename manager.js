var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "db_inventory"
});

connection.connect(function(err) {
  if (err) throw err;
  menu();
});

function menu() {
	inquirer
	.prompt({
		name: "action",
		type: "list",
		message: "What action to take?",
		choices: [
			"Display the inventory",
			"Inventory Restock",
			"View Low Inventory",
			"Add New Product",
			"Search by Specific"
		]
	})
	.then(function(answer) {
		switch (answer.action) {
			case "Display the inventory":
			display();
			break;
			//------------------------------------
			case "Inventory Restock": //price change
			restock();
			// display();
			break;
			//------------------------------------
			case "View Low Inventory":
			low();
			break;
			//------------------------------------
			case "Add New Product":
			addNew();
			// display();
			break;
			//------------------------------------
			case "Search by Specific":
			specific();
			// display();
			break;
			//------------------------------------
			default:


		}
	});
}

function display (){
	var query = "SELECT * FROM product ";
	connection.query(query, function(err, res) {
		for (var i = 0; i < res.length; i++) {
			console.log("\nID: " + res[i].id + " || Name: " + res[i].product_name + " || Brand: " + res[i].brand+ " || Category: " + res[i].category + " || Stock: " + res[i].stock_quantity + " || Price: " + res[i].price );
		}
	});
	menu();
}

function restock(){
	var allChoice = [];
	var displayChoice =[];
	var chosen =''
	var query1 = "SELECT product_name,brand FROM product ";
	connection.query(query1, function(err, res0) {
		for (var i = 0; i < res0.length; i++) {
			displayChoice.push(res0[i].product_name + ': '+res0[i].brand)
			allChoice.push(
				[
				{'product_name':res0[i].product_name},
				{'brand':res0[i].brand}
				]
				);
		}
		inquirer
		.prompt({
			name: 'what',
			type:"list",
			message: 'What do you want to restock?',
			choices:displayChoice
		}).then(function(result){
			chosen = result.what
			var ind = displayChoice.indexOf(chosen);
			// console.log(chosen);
			var query2 = "SELECT * FROM product WHERE ? AND ?";
			connection.query(query2,allChoice[ind],function(err, spe_product) {
				// for (var i = 0; i < spe_product.length; i++) {
					console.log("\nID: " + spe_product[0].id + " || Name: " + spe_product[0].product_name + " || Brand: " + spe_product[0].brand+ " || Category: " + spe_product[0].category + " || Stock: " + spe_product[0].stock_quantity + " || Price: " + spe_product[0].price );
				// }
				inquirer
				.prompt({
					name: 'amount',
					type:"input",
					message: 'How many?',
				}).then(function(result){
					var amo = parseInt(spe_product[0].stock_quantity)+parseInt(result.amount);
					// console.log(amo);
					allChoice[ind].unshift(amo);
					var query3 = "Update product Set stock_quantity = ? Where ? AND ?";
					connection.query(query3,allChoice[ind],function(err, updatething) {
						// for (var i = 0; i < updatething.length; i++) {
						// 	console.log("\nID: " + updatething[i].id + " || Name: " + updatething[i].product_name + " || Brand: " + updatething[i].brand+ " || Category: " + updatething[i].category + " || Stock: " + updatething[i].stock_quantity + " || Price: " + updatething[i].price );
						// }
						console.log('Done');
						display();		
					});
				});
			});
		});

	});
	
	
	
	
	// var query2 = "Update product Set price Where"
	// display();
}

function low(){
	var que = "SELECT * FROM product WHERE stock_quantity <=5";
	connection.query(que, function(err, res) {
		for (var i = 0; i < res.length; i++) {
			console.log("\nID: " + res[i].id + " || Name: " + res[i].product_name + " || Brand: " + res[i].brand+ " || Category: " + res[i].category + " || Stock: " + res[i].stock_quantity + " || Price: " + res[i].price );
		}
	});
	menu();
}

function addNew(){
	var variable = [];
	inquirer
	.prompt({
		message:"What is the product name?" ,
		name: 'name_temp'
	}).then(function(retu){
		variable.push(retu.name_temp);
		inquirer
		.prompt({
			message:"What is the brand?" ,
			name:'brand_temp'
		}).then(function(retu1){
			variable.push(retu1.brand_temp);
			inquirer
			.prompt({
				message:"what is the category?" ,
				name:'category_temp'
			}).then(function(retu2){
				variable.push(retu2.category_temp);
				inquirer
				.prompt({
					message:"How many do you have?" ,
					name:'many_temp'//validate
				}).then(function(retu3){
					variable.push(retu3.many_temp);
					inquirer
					.prompt({
						message:"How much is it?" ,
						name:'much_temp'//validate
					}).then(function(retu4){
						variable.push(retu4.much_temp);
						// var inside = variable.join(',')
						var queInside = "INSERT INTO product(product_name,brand,category,stock_quantity,price) VALUES (?,?,?,?,?)";
						connection.query(queInside,variable, function(err, res) {
							// for (var i = 0; i < res.length; i++) {
							// 	console.log("\nID: " + res[i].id + " || Name: " + res[i].product_name + " || Brand: " + res[i].brand+ " || Category: " + res[i].category + " || Stock: " + res[i].stock_quantity + " || Price: " + res[i].price );
							// }
							// display();
							menu();
						});

						// inquirer
						// .prompt({
						// 	message:"" ,
						// 	name:
						// }).then(function(retu5){
						// 	inquirer
						// 	.prompt({
						// 		message:"" ,
						// 		name:
						// 	}).then(function(retu6){
						// 		inquirer
						// 		.prompt({
						// 			message:"" ,
						// 			name:
						// 		}).then(function(retu7){
						// 			inquirer
						// 			.prompt({
						// 				message:"" ,
						// 				name:
						// 			}).then(function(retu8){

						// 			})	
						// 		})	
							// })	
						// })	
					})	
				})	
			})
		})
	})
}

function specific(){
	var query = "SELECT cat_id, cat_name,overhead_cost,product_sales , product_sales - overhead_cost AS final_profit FROM categories";
	connection.query(query, function(err, res) {
		for (var i = 0; i < res.length; i++) {
			console.log("\nID: " + res[i].cat_id + " || Name: " + res[i].cat_name + " || Overhead Cost: " + res[i].overhead_cost+ " || Product Sales: " + res[i].product_sales + " || Total Profit: " + res[i].final_profit);
		}
	});
	menu();
}
