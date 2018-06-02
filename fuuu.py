import numpy as np
import statsmodels.api as sm
import statsmodels.formula.api as smf

dat = sm.datasets.get_rdataset("Guerry", "HistData").data
print(dat)
results = smf.ols('Lottery ~ Literacy + np.log(Pop1831)', data=dat).fit()
print(results.summary())