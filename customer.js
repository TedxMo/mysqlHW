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
			"Inventory CheckOut"
		]
	})
	.then(function(answer) {
		switch (answer.action) {
			case "Display the inventory":
			display();
			break;
			//------------------------------------
			case "Inventory CheckOut":
			checkout();
			
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


function checkout(){
	var allChoice = [];
	var displayChoice =[];
	var chosen ='';
	var cate = '';
	var query1 = "SELECT product_name,brand,category FROM product ";
	connection.query(query1, function(err, res0) {
		for (var i = 0; i < res0.length; i++) {
			displayChoice.push(res0[i].product_name + ': '+res0[i].brand)
			allChoice.push(
				[
					{'product_name':res0[i].product_name},
					{'brand':res0[i].brand},
					{'category':res0[i].category}
				]
				);
		}
		inquirer
		.prompt({
			name: 'what',
			type:"list",
			message: 'What do you want to checkout?',
			choices:displayChoice
		}).then(function(result){

			chosen = result.what;
			var ind = displayChoice.indexOf(chosen);
			
			cate = allChoice[ind][2].category;
			console.log(allChoice[ind][2].category);
			console.log(cate);

			var query2 = "SELECT * FROM product WHERE ? AND ? AND ?;";
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
					var amo = parseInt(spe_product[0].stock_quantity) - parseInt(result.amount);
					if(amo<0){
						console.log('not enough to checkout');

					}else{
						// console.log(amo);
						var total_cost = parseInt(spe_product[0].price)*result.amount;
						var proList = [];
						allChoice[ind].unshift(amo);
						var query3 = "UPDATE product SET stock_quantity = ? WHERE ? AND ?";
						connection.query(query3,allChoice[ind],function(err, updatething) {
							console.log('\n',total_cost,'$ Thank you!');
							// console.log(allChoice[2])
						});

						var query4 = "SELECT product_sales, total_profit FROM categories WHERE cat_name = ?";
						connection.query(query4,cate,function(err, productList) {
							// console.log(productList);
							proList.push(parseInt(productList[0].product_sales),parseInt(productList[0].total_profit));
							// console.log(proList[0])
							proList[0] += total_cost;
							// console.log(proList[0])
							proList[1] += total_cost;
							proList.push(cate);
							console.log(proList)
							var query5 = "UPDATE categories Set product_sales = ?, total_profit = ?  WHERE cat_name = ?";
							connection.query(query5,proList,function(err, updatething) {
								console.log('Done');
							});
						});
					}
					display();
				});
			});
		});

	});
}
