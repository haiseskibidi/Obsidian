with open("fonts.css", "r", encoding="utf-8") as f:
    for line in f:
        if "font-family" in line:
            print(line.strip())
