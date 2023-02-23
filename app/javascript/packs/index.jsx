import React from "react";
import { createInertiaApp } from "@inertiajs/inertia-react";
import { render } from "react-dom";
import { createRoot } from "react-dom/client";
import Axios from "axios";

Axios.defaults.xsrfHeaderName = "X-CSRF-TOKEN";

import AccountHomeApp from "../components/AccountHomeApp";
import AccountIndexApp from "../components/AccountIndexApp";
import AccountTransactionsIndexApp from "../components/AccountTransactionsIndexApp";
import BudgetItemIndexApp from "../components/BudgetItemIndexApp";
import BudgetCategoryIndexApp from "../components/BudgetCategoryIndexApp";
import BudgetFinalizeApp from "../components/BudgetFinalizeApp";
import BudgetSetupApp from "../components/BudgetSetupApp";

const pages = {
  "AccountHomeApp": AccountHomeApp,
  "AccountIndexApp": AccountIndexApp,
  "AccountTransactionsIndexApp": AccountTransactionsIndexApp,
  "BudgetCategoryIndexApp": BudgetCategoryIndexApp,
  "BudgetItemIndexApp": BudgetItemIndexApp,
  "BudgetFinalizeApp": BudgetFinalizeApp,
  "BudgetSetupApp": BudgetSetupApp,
}

createInertiaApp({
  resolve: name => pages[name],
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />)
  },
})
