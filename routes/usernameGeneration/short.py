input_file = "/Users/alexkotz/Desktop/CU/Research/FeedbackSystem/FBS_v1/routes/usernameGeneration/adjectivelist.csv"
output_file = "/Users/alexkotz/Desktop/CU/Research/FeedbackSystem/FBS_v1/routes/usernameGeneration/adjectivelist_no_index.csv"

with open(input_file, "r") as infile, open(output_file, "w") as outfile:
    for line in infile:
        # Split the line by comma and take the second part (the adjective)
        adjective = line.split(",", 1)[1].strip(" ")
        # Write the adjective to the output file
        outfile.write(adjective)

print(f"Index removed and saved to {output_file}")
