// Data
const proteinCoefficients = {
  bulkup: {
    recommended: 2.2,
    description: "High-protein diet for maximum muscle growth",
  },
  lean_bulkup: {
    recommended: 2.0,
    description: "Clean muscle gain with minimal fat accumulation",
  },
  cutting: {
    recommended: 2.5,
    description: "Preserve muscle mass while losing body fat",
  },
  maintain: {
    recommended: 1.8,
    description: "Maintain current physique and performance",
  },
};

const activityMultipliers = {
  low: 1.0,
  moderate: 1.1,
  high: 1.2,
};

const mealDistribution = {
  Breakfast: 0.25,
  Lunch: 0.3,
  Dinner: 0.3,
  Snack: 0.15,
};

const mealTemplates = {
  bulkup: {
    breakfast: {
      name: "Power Breakfast",
      foods: [
        { name: "Whole Eggs", amount: "3 eggs", protein: 19.5 },
        { name: "Oatmeal", amount: "60g", protein: 10.1 },
        { name: "Milk", amount: "250ml", protein: 8.5 },
      ],
    },
    lunch: {
      name: "Bulking Lunch",
      foods: [
        { name: "Chicken Breast", amount: "200g", protein: 62.0 },
        { name: "Brown Rice", amount: "100g", protein: 7.9 },
        { name: "Broccoli", amount: "100g", protein: 2.8 },
      ],
    },
    dinner: {
      name: "Muscle Dinner",
      foods: [
        { name: "Salmon", amount: "180g", protein: 45.0 },
        { name: "Sweet Potato", amount: "150g", protein: 3.0 },
        { name: "Spinach", amount: "100g", protein: 2.9 },
      ],
    },
    snack: {
      name: "Post-Workout",
      foods: [
        { name: "Whey Protein", amount: "30g", protein: 24.0 },
        { name: "Banana", amount: "1 medium", protein: 1.1 },
      ],
    },
  },
  lean_bulkup: {
    breakfast: {
      name: "Lean Morning",
      foods: [
        { name: "Egg Whites", amount: "4 whites", protein: 14.0 },
        { name: "Oatmeal", amount: "50g", protein: 8.5 },
      ],
    },
    lunch: {
      name: "Clean Lunch",
      foods: [
        { name: "Chicken Breast", amount: "180g", protein: 55.8 },
        { name: "Brown Rice", amount: "70g", protein: 5.5 },
        { name: "Mixed Vegetables", amount: "150g", protein: 3.0 },
      ],
    },
    dinner: {
      name: "Lean Dinner",
      foods: [
        { name: "Tuna", amount: "150g", protein: 42.0 },
        { name: "Sweet Potato", amount: "100g", protein: 2.0 },
      ],
    },
    snack: {
      name: "Lean Snack",
      foods: [{ name: "Whey Protein", amount: "25g", protein: 20.0 }],
    },
  },
  cutting: {
    breakfast: {
      name: "Cut Breakfast",
      foods: [
        { name: "Egg Whites", amount: "5 whites", protein: 17.5 },
        { name: "Spinach", amount: "100g", protein: 2.9 },
      ],
    },
    lunch: {
      name: "Shred Lunch",
      foods: [
        { name: "Chicken Breast", amount: "200g", protein: 62.0 },
        { name: "Green Salad", amount: "200g", protein: 4.0 },
      ],
    },
    dinner: {
      name: "Fat Loss Dinner",
      foods: [
        { name: "White Fish", amount: "180g", protein: 40.0 },
        { name: "Broccoli", amount: "200g", protein: 5.6 },
      ],
    },
    snack: {
      name: "Night Protein",
      foods: [{ name: "Casein Protein", amount: "25g", protein: 19.5 }],
    },
  },
  maintain: {
    breakfast: {
      name: "Maintenance AM",
      foods: [
        { name: "Eggs", amount: "2 whole", protein: 13.0 },
        { name: "Toast", amount: "2 slices", protein: 6.0 },
      ],
    },
    lunch: {
      name: "Balanced Lunch",
      foods: [
        { name: "Chicken Breast", amount: "150g", protein: 46.5 },
        { name: "Brown Rice", amount: "80g", protein: 6.3 },
      ],
    },
    dinner: {
      name: "Steady Dinner",
      foods: [
        { name: "Tofu", amount: "150g", protein: 12.0 },
        { name: "Vegetables", amount: "150g", protein: 3.0 },
      ],
    },
    snack: {
      name: "Maintenance Snack",
      foods: [{ name: "Greek Yogurt", amount: "150g", protein: 15.0 }],
    },
  },
};

const proteinFoods = [
  { name: "Chicken Breast", protein: 31.0, category: "Meat" },
  { name: "Tuna", protein: 28.0, category: "Seafood" },
  { name: "Eggs", protein: 13.0, category: "Dairy" },
  { name: "Whey Protein", protein: 80.0, category: "Supplement" },
  { name: "Tofu", protein: 8.0, category: "Plant-Based" },
  { name: "Greek Yogurt", protein: 10.0, category: "Dairy" },
  { name: "Salmon", protein: 25.0, category: "Seafood" },
  { name: "Lean Beef", protein: 26.0, category: "Meat" },
];

// Form handling
document.getElementById("proteinForm").addEventListener("submit", function (e) {
  e.preventDefault();
  calculateProtein();
});

function calculateProtein() {
  const weight = parseFloat(document.getElementById("weight").value);
  const goal = document.getElementById("goal").value;
  const activity = document.getElementById("activity").value;

  if (!weight || !goal || !activity) {
    alert("Please fill in all fields.");
    return;
  }

  if (weight < 40 || weight > 150) {
    alert("Please enter a weight between 40-150 kg.");
    return;
  }

  // Show loading
  document.getElementById("loading").style.display = "block";

  setTimeout(() => {
    const coefficient = proteinCoefficients[goal].recommended;
    const multiplier = activityMultipliers[activity];
    const totalProtein = Math.round(weight * coefficient * multiplier);

    // Hide loading
    document.getElementById("loading").style.display = "none";

    // Show results
    displayResults(totalProtein, goal, weight);
  }, 1500);
}

function displayResults(totalProtein, goal, weight) {
  // Animate protein amount
  animateNumber(document.getElementById("proteinAmount"), totalProtein);
  document.getElementById("goalDescription").textContent =
    proteinCoefficients[goal].description;

  // Show result section with animation
  const resultSection = document.getElementById("resultSection");
  resultSection.style.display = "block";
  resultSection.scrollIntoView({ behavior: "smooth" });

  // Nutrition breakdown
  const calories =
    weight * (goal === "bulkup" ? 45 : goal === "cutting" ? 28 : 35);
  document.getElementById("nutritionBreakdown").innerHTML = `
                <div class="d-flex justify-content-between mb-2">
                    <span>Daily Calories</span>
                    <span class="protein-badge">${Math.round(
                      calories
                    )} kcal</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span>Protein</span>
                    <span class="protein-badge">${totalProtein}g</span>
                </div>
                <div class="d-flex justify-content-between">
                    <span>Carbohydrates</span>
                    <span class="protein-badge">${Math.round(
                      (calories * 0.4) / 4
                    )}g</span>
                </div>
            `;

  // Meal breakdown
  let mealBreakdownHtml = "";
  for (const [meal, ratio] of Object.entries(mealDistribution)) {
    const mealProtein = Math.round(totalProtein * ratio);
    mealBreakdownHtml += `
                    <div class="d-flex justify-content-between mb-2">
                        <span>${meal}</span>
                        <span class="protein-badge">${mealProtein}g</span>
                    </div>
                `;
  }
  document.getElementById("mealBreakdown").innerHTML = mealBreakdownHtml;

  // Show meal plans
  displayMealPlans(goal);

  // Show protein chart
  displayProteinChart();
}

function animateNumber(element, target) {
  let current = 0;
  const increment = target / 50;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    element.textContent = Math.round(current) + "g";
  }, 30);
}

function displayMealPlans(goal) {
  const mealPlansSection = document.getElementById("mealPlansSection");
  const mealPlans = document.getElementById("mealPlans");

  let html = '<div class="row">';

  const meals = mealTemplates[goal];
  for (const [mealType, mealData] of Object.entries(meals)) {
    const totalProtein = mealData.foods.reduce(
      (sum, food) => sum + food.protein,
      0
    );

    html += `
                    <div class="col-md-6 mb-4">
                        <div class="meal-card">
                            <h5 class="meal-title">${mealData.name}</h5>
                            <div class="mb-3">
                `;

    mealData.foods.forEach((food) => {
      html += `
                        <div class="food-item">
                            <span>${food.name} (${food.amount})</span>
                            <span class="protein-badge">${food.protein}g</span>
                        </div>
                    `;
    });

    html += `
                            </div>
                            <div class="text-center">
                                <strong>Total Protein: ${totalProtein.toFixed(
                                  1
                                )}g</strong>
                            </div>
                        </div>
                    </div>
                `;
  }

  html += "</div>";
  mealPlans.innerHTML = html;
  mealPlansSection.style.display = "block";
}

function displayProteinChart() {
  const proteinChart = document.getElementById("proteinChart");
  const proteinChartSection = document.getElementById("proteinChartSection");

  let html = "";
  proteinFoods.forEach((food) => {
    html += `
                    <div class="col-md-3 col-sm-6 mb-3">
                        <div class="meal-card text-center">
                            <h6 class="meal-title">${food.name}</h6>
                            <div class="protein-amount" style="font-size: 1.5rem;">${food.protein}g</div>
                            <small class="text-muted">per 100g</small>
                            <div class="mt-2">
                                <span class="badge bg-secondary">${food.category}</span>
                            </div>
                        </div>
                    </div>
                `;
  });

  proteinChart.innerHTML = html;
  proteinChartSection.style.display = "block";
}

function switchLanguage() {
  // This will switch to Korean version
  alert("Switching to Korean version!");
}

// Smooth scrolling for better UX
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
      });
    }
  });
});

// Add some entrance animations
window.addEventListener("load", function () {
  const cards = document.querySelectorAll(".input-card, .meal-card");
  cards.forEach((card, index) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";
    setTimeout(() => {
      card.style.transition = "all 0.6s ease";
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }, index * 100);
  });
});
