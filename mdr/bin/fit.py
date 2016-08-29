from mdr import MDR
import pandas as pd
status_col_name='status'
genetic_data = pd.read_csv('/share/devel/Gp/mdr/datasets/imputed.csv', sep='\t')
features = genetic_data.drop(status_col_name, axis=1).values
labels = genetic_data[status_col_name].values
my_mdr = MDR(default_label=0, tie_break=1)
#output = pd.read_csv('/share/devel/Gp/mdr/datasets/imputed.csv', sep='\t')
