# from flask import Flask, render_template, request
# from sklearn.feature_extraction.text import TfidfVectorizer
# from sklearn.linear_model import PassiveAggressiveClassifier
# import pickle
# import pandas as pd
# from sklearn.model_selection import train_test_split

# app = Flask(__name__)

# # Load model
# loaded_model = pickle.load(open('model.pkl', 'rb'))

# # Load dataset for TF-IDF vocabulary
# dataframe = pd.read_csv('news_dataset.csv')
# x = dataframe['text']
# y = dataframe['label']
# x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=0)

# # ⬇️ Add this line: fit vectorizer on training data only once (outside function)
# tfvect = TfidfVectorizer(stop_words='english', max_df=0.7)
# tfvect.fit(x_train)







# # Fake news detector function
# def fake_news_det(news):
#     # ⬇️ Don't fit again here, just transform
#     vectorized_input_data = tfvect.transform([news])
#     prediction = loaded_model.predict(vectorized_input_data)
#     return prediction[0]

# # Main homepage (indexx.html)
# @app.route('/')
# def main_page():
#     return render_template('indexx.html')

# # Fake news form page (index.html)
# @app.route('/fakenews')
# def fake_news_page():
#     return render_template('index.html')  # Contains the textarea form

# # Handle form submit
# # @app.route('/predict', methods=['POST'])
# # def predict():
# #     message = request.form['message']
# #     prediction = fake_news_det(message)
# #     return render_template('index.html', prediction=prediction)



# @app.route('/predict', methods=['POST'])
# def predict():
#     message = request.form.get('message', '')  # Get safely, default to empty string
#     message = '' if pd.isna(message) else str(message)  # Clean it
    
#     if message.strip() == '':
#         return render_template('index.html', prediction="Please enter a news article to check.")
    
#     prediction = fake_news_det(message)
#     return render_template('index.html', prediction=prediction)

# if __name__ == '__main__':
#     app.run(debug=True, port=5002)


from flask import Flask, render_template, request
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import PassiveAggressiveClassifier
import pickle
import pandas as pd
from sklearn.model_selection import train_test_split

app = Flask(__name__)

# Load pre-trained model
loaded_model = pickle.load(open('model.pkl', 'rb'))

# Load dataset for TF-IDF vocabulary and split data
dataframe = pd.read_csv('news_dataset.csv')

# Clean the text column
x = dataframe['text'].astype(str).dropna()  # Convert to string, drop NaN
y = dataframe.loc[x.index, 'label']         # Keep labels aligned

# Now do train/test split
x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=0)

# Fit TF-IDF only on training data
tfvect = TfidfVectorizer(stop_words='english', max_df=0.7)
tfvect.fit(x_train)

# Fake news detector function
def fake_news_det(news):
    try:
        # Convert the news input to a string and strip any unwanted whitespace
        news = str(news).strip()
        
        # If the input is empty after cleaning, return a message
        if not news:
            return "Please enter a valid news article to check."

        # Vectorize the input
        vectorized_input_data = tfvect.transform([news])

        # Make prediction
        prediction = loaded_model.predict(vectorized_input_data)
        
        return prediction[0]  # Return either "REAL" or "FAKE"
    except Exception as e:
        print(f"Error in fake_news_det function: {e}")
        return "An error occurred during the prediction process."

# Home route for the main page (indexx.html)
@app.route('/')
def main_page():
    return render_template('indexx.html')

# Route for the fake news form page (index.html)
@app.route('/fakenews')
def fake_news_page():
    return render_template('index.html')

# Route to handle form submission and make predictions
@app.route('/predict', methods=['POST'])
def predict():
    try:
          
          
        # Get message input from the form and force it to be a string
        # message = request.form.get('message', '').strip()
          message = request.form.get('message', '')  # Get safely, default to empty string
          message = '' if pd.isna(message) else str(message)  # Clean it
    
        
        # Debugging: Print the received message
          print(f"Received message: {message}")
        
          if not message:
            return render_template('index.html', prediction="Please enter a valid news article to check.")
        
        # Call the fake news detection function with the user's input
          prediction = fake_news_det(message)
        
        # Debugging: Print the prediction result
          print(f"Prediction: {prediction}")
        
        # Render the page with the prediction result
          return render_template('index.html', prediction=prediction)
    
    except Exception as e:
        print(f"Error in /predict route: {e}")
        return render_template('index.html', prediction="An error occurred while processing your request.")

if __name__ == '__main__':
    app.run(debug=True, port=5007)

